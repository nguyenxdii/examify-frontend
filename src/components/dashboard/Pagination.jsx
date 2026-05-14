import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage,
  label = "mục",
  showFirstLast = true,
  showSummary = true
}) {
  const { t } = useTranslation();

  // If no items at all, show nothing
  if (totalItems === 0) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={cn(
            "w-10 h-10 rounded-xl text-sm font-black transition-all border",
            currentPage === i 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-card border-border hover:border-primary/40 text-muted-foreground hover:text-primary"
          )}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="px-6 py-5 bg-muted/10 border-t border-border flex flex-col sm:flex-row items-center gap-6 justify-center relative">
      <div className="order-2 sm:order-1 sm:absolute sm:left-6" />

      {totalPages > 1 && (
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <div className="flex items-center gap-1">
            {showFirstLast && (
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                className="w-10 h-10 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border transition-all"
                title={t("common.first_page") || "Trang đầu"}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            )}
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="w-10 h-10 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 mx-1">
            {renderPageButtons()}
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="w-10 h-10 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {showFirstLast && (
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                className="w-10 h-10 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border transition-all"
                title={t("common.last_page") || "Trang cuối"}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
