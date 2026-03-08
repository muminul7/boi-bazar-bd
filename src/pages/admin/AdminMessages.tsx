import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setMessages((data as any as Message[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (msg: Message) => {
    await supabase.from("contact_messages" as any).update({ read: true } as any).eq("id", msg.id);
    setSelected(msg);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই বার্তা মুছতে চান?")) return;
    await supabase.from("contact_messages" as any).delete().eq("id", id);
    toast({ title: "বার্তা মুছে ফেলা হয়েছে" });
    fetchMessages();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-bengali text-foreground mb-6">যোগাযোগ বার্তা</h1>

      <Card className="shadow-brand-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">লোড হচ্ছে...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">কোনো বার্তা আসেনি।</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bengali">নাম</TableHead>
                  <TableHead className="font-bengali">ইমেইল</TableHead>
                  <TableHead className="font-bengali">বার্তা</TableHead>
                  <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                  <TableHead className="font-bengali">তারিখ</TableHead>
                  <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.id} className={!msg.read ? "bg-primary-subtle/30" : ""}>
                    <TableCell className="font-bengali font-medium">{msg.name}</TableCell>
                    <TableCell className="text-sm">{msg.email}</TableCell>
                    <TableCell className="font-bengali text-sm max-w-[200px] truncate">{msg.message}</TableCell>
                    <TableCell>
                      <span className={`badge-pill text-xs ${msg.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                        {msg.read ? "পড়া হয়েছে" : "নতুন"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString("bn-BD")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => markRead(msg)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali">বার্তা বিস্তারিত</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 mt-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-bengali text-muted-foreground">নাম:</span> <span className="font-bengali font-medium">{selected.name}</span></div>
                <div><span className="font-bengali text-muted-foreground">ইমেইল:</span> {selected.email}</div>
                {selected.phone && <div><span className="font-bengali text-muted-foreground">ফোন:</span> {selected.phone}</div>}
                <div><span className="font-bengali text-muted-foreground">তারিখ:</span> {new Date(selected.created_at).toLocaleDateString("bn-BD")}</div>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="font-bengali text-foreground whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}