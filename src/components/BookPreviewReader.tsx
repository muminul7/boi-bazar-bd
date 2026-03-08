import { useState } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewPage {
  pageNumber: number;
  content: string;
}

interface BookPreviewReaderProps {
  open: boolean;
  onClose: () => void;
  pages: PreviewPage[];
  bookTitle: string;
  totalPages: number;
  onBuyClick: () => void;
}

export default function BookPreviewReader({
  open,
  onClose,
  pages,
  bookTitle,
  totalPages,
  onBuyClick,
}: BookPreviewReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!open) return null;

  const isLastPreviewPage = currentPage === pages.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl border border-border shadow-brand-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-bengali font-semibold text-foreground text-sm truncate max-w-[200px] sm:max-w-none">
                  {bookTitle}
                </span>
                <span className="badge-pill bg-primary-subtle text-primary text-[11px]">
                  ফ্রি প্রিভিউ
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs text-muted-foreground font-body mb-4">
                    পৃষ্ঠা {pages[currentPage].pageNumber} / {totalPages}
                  </p>
                  <div className="font-bengali text-foreground leading-[2] text-[15px] whitespace-pre-line">
                    {pages[currentPage].content}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Locked overlay on last page */}
              {isLastPreviewPage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 bg-gradient-hero rounded-xl p-6 text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-bengali font-bold text-primary-foreground text-lg mb-1">
                    প্রিভিউ এখানেই শেষ!
                  </h3>
                  <p className="font-bengali text-primary-foreground/80 text-sm mb-4">
                    বাকি {totalPages - pages[pages.length - 1].pageNumber} পৃষ্ঠা পড়তে সম্পূর্ণ বই কিনুন
                  </p>
                  <Button
                    onClick={onBuyClick}
                    className="bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali shadow-gold"
                  >
                    সম্পূর্ণ বই কিনুন
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="gap-1.5 font-bengali"
              >
                <ChevronLeft className="h-4 w-4" />
                আগের পৃষ্ঠা
              </Button>
              <span className="text-xs font-body text-muted-foreground">
                {currentPage + 1} / {pages.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={isLastPreviewPage}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="gap-1.5 font-bengali"
              >
                পরের পৃষ্ঠা
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
