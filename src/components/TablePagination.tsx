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
    <div className="px-8 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-6 rounded-b-[24px]">

      {/* Records Info */}
      <div className="flex items-center gap-6">
        <p className="text-[13px] text-[#444441] font-medium tracking-tight">
          Showing <span className="text-foreground font-bold">{startItem}-{endItem}</span>
          <span className="text-[#B0AFA8] mx-1.5 font-normal">of</span>
          <span className="text-foreground font-bold">{totalItems}</span>
          <span className="text-[#B0AFA8] ml-1.5 font-medium">{itemName}</span>
        </p>

        <div className="h-4 w-[1px] bg-slate-100" />

        <div className="flex items-center gap-2.5">
          <span className="text-[12px] text-[#B0AFA8] font-medium">per page</span>
          <div className="flex items-center gap-1.5 bg-[#F7F8F4]/50 border border-slate-100 rounded-lg p-1 group focus-within:border-primary/40 focus-within:bg-white transition-all">
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
                <button className="size-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-primary transition-all">
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
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-primary hover:bg-[#F7F8F4] transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Previous page"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
          </button>

          <div className="flex items-center gap-2 px-1">
            <span className="text-[12px] text-[#B0AFA8] font-medium">page</span>
            <input
              type="text"
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  onPageChange(val);
                }
              }}
              className="w-8 h-7 bg-[#F7F8F4]/50 border border-slate-100 rounded-lg text-center text-[12px] font-bold text-foreground outline-none focus:bg-white focus:border-primary/40 transition-all tabular-nums"
            />
            <span className="text-[12px] text-[#B0AFA8] font-medium">of {totalPages || 1}</span>
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-primary hover:bg-[#F7F8F4] transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Next page"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
