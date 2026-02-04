import { useNavigate } from 'react-router-dom';
import { PropertiesView as PropertiesContent } from '@/views/PropertiesView';
import { PropertiesSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/types';

export default function Properties() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, addProperty, isLoading } = useProperties(user?.id);

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleAddProperty = (newProperty: Property) => {
    addProperty(newProperty);
  };

  if (isLoading) {
    return <PropertiesSkeleton />;
  }

  return (
    <PropertiesContent
      properties={properties}
      onViewProperty={handleViewProperty}
      onAddProperty={handleAddProperty}
    />
  );
}
