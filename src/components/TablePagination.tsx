import { MenuDropdown } from "./MenuDropdown";

interface TablePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  itemName?: string;
}

export const TablePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemName = "results",
}: TablePaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const entriesOptions = [10, 25, 50, 100];

  return (
    <div className="px-8 py-4 border-t border-border bg-card flex items-center justify-between gap-6 rounded-b-[24px]">

      {/* Records Info */}
      <div className="flex items-center gap-6">
        <p className="text-[13px] text-muted-foreground font-medium tracking-tight">
          Showing <span className="text-foreground font-bold">{startItem}-{endItem}</span>
          <span className="text-muted-foreground mx-1.5 font-normal">of</span>
          <span className="text-foreground font-bold">{totalItems}</span>
          <span className="text-muted-foreground ml-1.5 font-medium">{itemName}</span>
        </p>

        <div className="h-4 w-[1px] bg-border" />

        <div className="flex items-center gap-2.5">
          <span className="text-[12px] text-muted-foreground font-medium">per page</span>
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg p-1 group focus-within:border-primary/40 focus-within:bg-card transition-all">
            <input
              type="text"
              value={itemsPerPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0 && val <= 500) {
                  onItemsPerPageChange(val);
                }
              }}
              className="w-8 h-7 bg-transparent text-center text-[12px] font-bold text-foreground outline-none tabular-nums"
            />
            <MenuDropdown
              side="top"
              width="w-24"
              trigger={
                <button className="size-7 flex items-center justify-center rounded-md hover:bg-card hover:shadow-sm text-primary transition-all">
                  <span className="material-symbols-outlined text-[18px]">expand_less</span>
                </button>
              }
              items={entriesOptions.map(opt => ({
                label: `${opt}`,
                onClick: () => onItemsPerPageChange(opt)
              }))}
              align="left"
            />
          </div>
        </div>
      </div>

      {/* Navigation Suite */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Previous page"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
          </button>

          <div className="flex items-center gap-2 px-1">
            <span className="text-[12px] text-muted-foreground font-medium">page</span>
            <input
              type="text"
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  onPageChange(val);
                }
              }}
              className="w-8 h-7 bg-muted/50 border border-border rounded-lg text-center text-[12px] font-bold text-foreground outline-none focus:bg-card focus:border-primary/40 transition-all tabular-nums"
            />
            <span className="text-[12px] text-muted-foreground font-medium">of {totalPages || 1}</span>
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Next page"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
