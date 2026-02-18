import { Link } from "react-router-dom";
import { Star, ShoppingCart, Award, Zap } from "lucide-react";
import { Book } from "@/data/books";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);

  return (
    <Link to={`/books/${book.slug}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover-lift shadow-brand-sm hover:shadow-brand-lg transition-all duration-300">
        {/* Cover */}
        <div className="relative overflow-hidden aspect-[3/4] bg-muted">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {book.bestSeller && (
              <span className="badge-pill bg-secondary text-secondary-foreground text-[11px] gap-1 flex items-center shadow-gold">
                <Award className="h-3 w-3" /> বেস্টসেলার
              </span>
            )}
            {book.newRelease && (
              <span className="badge-pill bg-primary text-primary-foreground text-[11px] gap-1 flex items-center">
                <Zap className="h-3 w-3" /> নতুন
              </span>
            )}
          </div>
          {discount > 0 && (
            <div className="absolute top-2.5 right-2.5">
              <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center text-[11px] font-bold text-destructive-foreground font-body shadow">
                -{discount}%
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-primary font-semibold font-bengali mb-1">{book.category}</p>
          <h3 className="font-bengali font-bold text-foreground text-base leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground font-bengali mb-2.5 line-clamp-2">{book.shortDescription}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i <= Math.round(book.rating) ? "star-filled fill-current" : "star-empty"}`}
                />
              ))}
            </div>
            <span className="text-xs font-body font-semibold text-foreground">{book.rating}</span>
            <span className="text-xs text-muted-foreground font-body">({book.reviewCount})</span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-body text-primary">৳{book.price}</span>
              {book.originalPrice > book.price && (
                <span className="text-sm text-muted-foreground line-through font-body">৳{book.originalPrice}</span>
              )}
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-xs shadow-gold"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              কিনুন
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
