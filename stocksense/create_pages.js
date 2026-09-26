const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'products', title: 'Products', description: 'Manage your inventory items.' },
  { path: 'warehouses', title: 'Warehouses', description: 'Manage warehouse locations and capacity.' },
  { path: 'operations', title: 'All Operations', description: 'View all inventory movements.' },
  { path: 'operations/receipts', title: 'Receipts', description: 'Manage incoming stock.' },
  { path: 'operations/deliveries', title: 'Deliveries', description: 'Manage outgoing stock.' },
  { path: 'operations/transfers', title: 'Transfers', description: 'Move stock between locations.' },
  { path: 'operations/adjustments', title: 'Adjustments', description: 'Adjust stock levels after physical counts.' },
  { path: 'ledger', title: 'Stock Ledger', description: 'Complete history of all inventory movements.' },
  { path: 'ai', title: 'AI Assistant', description: 'Ask questions about your inventory.' },
  { path: 'settings', title: 'Settings', description: 'Configure your StockSense application.' },
];

pages.forEach(page => {
  const fileContent = `export default function ${page.title.replace(/\s+/g, '')}Page() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto h-[80vh] flex flex-col justify-center items-center text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">${page.title}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          ${page.description}
        </p>
      </div>
      <div className="p-8 border border-dashed rounded-xl border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">This page is under construction. It will be built in the next phase of the hackathon!</p>
      </div>
    </div>
  );
}
`;
  
  const fullPath = path.join('app/(dashboard)', page.path, 'page.tsx');
  fs.writeFileSync(fullPath, fileContent);
  console.log(`Created ${fullPath}`);
});
