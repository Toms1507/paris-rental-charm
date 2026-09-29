import { Star } from "lucide-react";
import type { Review } from "@/content/site";

/** Logo Airbnb (Bélo), pour indiquer la provenance des avis. */
export function AirbnbLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-label="Airbnb" role="img" className={className} fill="#FF385C">
      <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.267 3.42-6.414 3.615l-.28.019-.267.006C5.377 31 2.5 28.584 2.5 24.522l.005-.469c.026-.928.23-1.768.83-3.244l.216-.524c.966-2.298 6.083-12.989 7.707-16.034C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.605 2.24l-.009.33v.206C4.5 27.395 6.411 29 8.857 29c1.773 0 3.87-1.236 5.831-3.354-2.295-2.938-3.855-6.45-3.855-8.91 0-2.913 1.933-5.386 5.178-5.386 3.223 0 5.156 2.456 5.156 5.387 0 2.456-1.555 5.96-3.857 8.9 1.954 2.118 4.05 3.363 5.832 3.363 2.446 0 4.357-1.605 4.357-4.478l-.004-.411a4.919 4.919 0 0 0-.311-1.564l-.192-.505-.303-.747c-.967-2.253-5.112-10.913-7.048-14.694l-.584-1.121C18.012 3.513 17.232 3 16 3zm.01 10.316c-2.01 0-3.177 1.465-3.177 3.39 0 1.93 1.172 4.76 3.182 7.303 2.009-2.542 3.177-5.373 3.177-7.303 0-1.925-1.167-3.39-3.182-3.39z" />
    </svg>
  );
}

/** Carte d'avis au format Airbnb : initiale, prénom, ville, note, date, texte. */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center gap-3.5">
        {review.photo ? (
          <img
            src={review.photo}
            alt={`Photo de ${review.name}`}
            width={48}
            height={48}
            loading="lazy"
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF385C]/10 text-lg font-semibold text-[#E31C5F]"
          >
            {review.name.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{review.name}</p>
          <p className="text-sm text-muted-foreground">{review.from}</p>
        </div>
        <AirbnbLogo className="h-6 shrink-0" />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className="flex gap-0.5 text-foreground"
          aria-label={`${review.rating} étoiles sur 5`}
        >
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-current" />
          ))}
        </span>
        · {review.date}
      </p>
      <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed whitespace-pre-line">
        {review.text}
      </p>
      {review.language && (
        <p className="mt-4 text-xs text-muted-foreground">
          Langue d'origine&nbsp;: {review.language} · traduit par Airbnb
        </p>
      )}
    </article>
  );
}
