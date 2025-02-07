import { DashboardComponent } from "@/types/dashboard";

interface DashboardLayoutProps {
  components: DashboardComponent[];
  className?: string;
}

export const DashboardLayout = ({ components, className }: DashboardLayoutProps) => {
  return (
    <div className={`grid grid-cols-12 ${className}`}>
      {components.map((item, index) => (
        <div 
          key={index} 
          className={item.className || 'col-span-12'}
          style={item.gridArea ? { gridArea: item.gridArea } : undefined}
        >
          <item.component />
        </div>
      ))}
    </div>
  );
};