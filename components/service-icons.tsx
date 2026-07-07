import {
  Stethoscope,
  Truck,
  Building2,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

/** Maps a service slug to its lucide icon. No emojis anywhere. */
export const serviceIcons: Record<string, LucideIcon> = {
  "medical-courier": Stethoscope,
  "freight-delivery": Truck,
  "facilities-management": Building2,
  "workforce-solutions": Users,
  "warehouse-storage": Warehouse,
};
