'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToastWithTypes } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { Edit, Eye, GripVertical, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface Advertisement {
  _id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  badgeTitle?: string;
  title: string;
  discountText?: string;
  bannerImage: string;
  cta?: {
    label: string;
    url: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormValues {
  position: number;
  badgeTitle: string;
  title: string;
  discountText: string;
  bannerImage: string;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
}

// Validation schemas
const horizontalAdSchema = Yup.object().shape({
  position: Yup.number()
    .required('Position is required')
    .min(1, 'Position must be 1 or 2')
    .max(2, 'Position must be 1 or 2'),
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  bannerImage: Yup.string().required('Banner image is required'),
  badgeTitle: Yup.string(),
  discountText: Yup.string(),
  ctaLabel: Yup.string(),
  ctaUrl: Yup.string().url('Must be a valid URL'),
  isActive: Yup.boolean()
});

const verticalAdSchema = Yup.object().shape({
  position: Yup.number()
    .required('Position is required')
    .min(1, 'Position must be 1, 2, or 3')
    .max(3, 'Position must be 1, 2, or 3'),
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  discountText: Yup.string().required('Discount text is required'),
  bannerImage: Yup.string().required('Banner image is required'),
  ctaLabel: Yup.string(),
  ctaUrl: Yup.string().url('Must be a valid URL'),
  isActive: Yup.boolean()
});

export default function AdvertisementsPage() {
  const [horizontalAds, setHorizontalAds] = useState<Advertisement[]>([]);
  const [verticalAds, setVerticalAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('horizontal');

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToastWithTypes();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/advertisements');
      const data = await response.json();

      if (data.success) {
        const horizontal = data.advertisements.filter((ad: Advertisement) => ad.type === 'horizontal');
        const vertical = data.advertisements.filter((ad: Advertisement) => ad.type === 'vertical');
        setHorizontalAds(horizontal);
        setVerticalAds(vertical);
      }
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      error('Failed to load advertisements', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues, type: 'horizontal' | 'vertical') => {
    try {
      const payload: any = {
        type,
        position: values.position,
        title: values.title,
        bannerImage: values.bannerImage,
        isActive: values.isActive
      };

      if (values.badgeTitle) payload.badgeTitle = values.badgeTitle;
      if (values.discountText) payload.discountText = values.discountText;

      if (values.ctaLabel && values.ctaUrl) {
        payload.cta = {
          label: values.ctaLabel,
          url: values.ctaUrl
        };
      }

      const url = editingAd
        ? `/api/admin/advertisements/${editingAd._id}`
        : '/api/admin/advertisements';
      const method = editingAd ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details?.join(', ') || data.error || 'Failed to save advertisement');
      }

      success(
        editingAd ? 'Updated' : 'Created',
        `Advertisement ${editingAd ? 'updated' : 'created'} successfully`
      );

      setShowDialog(false);
      setEditingAd(null);
      fetchAdvertisements();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingAd) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/advertisements?id=${deletingAd._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete advertisement');
      }

      success('Deleted', 'Advertisement deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingAd(null);
      fetchAdvertisements();
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, type: 'horizontal' | 'vertical') => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const ads = type === 'horizontal' ? horizontalAds : verticalAds;
    const setAds = type === 'horizontal' ? setHorizontalAds : setVerticalAds;

    const oldIndex = ads.findIndex((ad) => ad._id === active.id);
    const newIndex = ads.findIndex((ad) => ad._id === over.id);

    const reorderedAds = arrayMove(ads, oldIndex, newIndex);

    // Update positions in the reordered array
    const updatedAds = reorderedAds.map((ad, index) => ({
      ...ad,
      position: index + 1
    }));

    // Optimistically update UI
    setAds(updatedAds);

    try {
      // Send reorder request to backend
      const response = await fetch('/api/admin/advertisements/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          items: updatedAds.map(ad => ({
            _id: ad._id,
            position: ad.position
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reorder advertisements');
      }

      success('Reordered', 'Advertisements reordered successfully');
      fetchAdvertisements();
    } catch (err: any) {
      error('Error', err.message);
      // Revert on error
      setAds(ads);
    }
  };

  const getInitialValues = (type: 'horizontal' | 'vertical'): FormValues => {
    if (editingAd) {
      return {
        position: editingAd.position,
        badgeTitle: editingAd.badgeTitle || '',
        title: editingAd.title,
        discountText: editingAd.discountText || '',
        bannerImage: editingAd.bannerImage,
        ctaLabel: editingAd.cta?.label || '',
        ctaUrl: editingAd.cta?.url || '',
        isActive: editingAd.isActive
      };
    }

    const existingAds = type === 'horizontal' ? horizontalAds : verticalAds;
    const maxPosition = type === 'horizontal' ? 2 : 3;
    const occupiedPositions = existingAds.map(ad => ad.position);
    const nextPosition = Array.from({ length: maxPosition }, (_, i) => i + 1)
      .find(pos => !occupiedPositions.includes(pos)) || 1;

    return {
      position: nextPosition,
      badgeTitle: '',
      title: '',
      discountText: '',
      bannerImage: '',
      ctaLabel: '',
      ctaUrl: '',
      isActive: true
    };
  };

  const openCreateDialog = (type: 'horizontal' | 'vertical') => {
    setEditingAd(null);
    setActiveTab(type);
    setShowDialog(true);
  };

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad);
    setActiveTab(ad.type);
    setShowDialog(true);
  };

  const openPreviewDialog = (ad: Advertisement) => {
    setPreviewAd(ad);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
            <p className="text-gray-600 mt-1">Manage horizontal and vertical advertisement banners</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="horizontal">
              Horizontal Ads (2)
            </TabsTrigger>
            <TabsTrigger value="vertical">
              Vertical Ads (3)
            </TabsTrigger>
          </TabsList>

          {/* Horizontal Ads */}
          <TabsContent value="horizontal" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Display 2 horizontal banner cards between All Products and Events sections
                </p>
                <Button
                  onClick={() => openCreateDialog('horizontal')}
                  disabled={horizontalAds.length >= 2}
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add Horizontal Ad
                </Button>
              </div>

              {horizontalAds.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Horizontal Ads</h3>
                    <p className="text-sm text-gray-600 mb-4">Create your first horizontal advertisement banner</p>
                    <Button onClick={() => openCreateDialog('horizontal')}>
                      <Plus size={16} className="mr-2" />
                      Create Horizontal Ad
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-3 flex items-center">
                    <GripVertical size={14} className="mr-1" />
                    Drag cards to reorder positions
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, 'horizontal')}
                  >
                    <SortableContext
                      items={horizontalAds.map(ad => ad._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {horizontalAds.map((ad) => (
                          <SortableAdCard
                            key={ad._id}
                            ad={ad}
                            onEdit={() => openEditDialog(ad)}
                            onDelete={() => {
                              setDeletingAd(ad);
                              setDeleteDialogOpen(true);
                            }}
                            onPreview={() => openPreviewDialog(ad)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Vertical Ads */}
          <TabsContent value="vertical" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Display 3 vertical cards between Featured Products and Social Proof sections
                </p>
                <Button
                  onClick={() => openCreateDialog('vertical')}
                  disabled={verticalAds.length >= 3}
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add Vertical Ad
                </Button>
              </div>

              {verticalAds.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vertical Ads</h3>
                    <p className="text-sm text-gray-600 mb-4">Create your first vertical advertisement card</p>
                    <Button onClick={() => openCreateDialog('vertical')}>
                      <Plus size={16} className="mr-2" />
                      Create Vertical Ad
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-3 flex items-center">
                    <GripVertical size={14} className="mr-1" />
                    Drag cards to reorder positions
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, 'vertical')}
                  >
                    <SortableContext
                      items={verticalAds.map(ad => ad._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {verticalAds.map((ad) => (
                          <SortableAdCard
                            key={ad._id}
                            ad={ad}
                            onEdit={() => openEditDialog(ad)}
                            onDelete={() => {
                              setDeletingAd(ad);
                              setDeleteDialogOpen(true);
                            }}
                            onPreview={() => openPreviewDialog(ad)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit' : 'Create'} {activeTab === 'horizontal' ? 'Horizontal' : 'Vertical'} Advertisement
              </DialogTitle>
            </DialogHeader>

            <Formik
              initialValues={getInitialValues(activeTab as 'horizontal' | 'vertical')}
              validationSchema={activeTab === 'horizontal' ? horizontalAdSchema : verticalAdSchema}
              onSubmit={(values) => handleSubmit(values, activeTab as 'horizontal' | 'vertical')}
              enableReinitialize
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Position */}
                  <div>
                    <Label htmlFor="position">
                      Position {activeTab === 'horizontal' ? '(1-2)' : '(1-3)'} *
                    </Label>
                    <Input
                      id="position"
                      type="number"
                      min="1"
                      max={activeTab === 'horizontal' ? 2 : 3}
                      value={values.position}
                      onChange={(e) => setFieldValue('position', parseInt(e.target.value))}
                    />
                    {errors.position && touched.position && (
                      <p className="text-sm text-red-600 mt-1">{errors.position}</p>
                    )}
                    {editingAd && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Tip: Changing position will swap with the ad at that position
                      </p>
                    )}
                  </div>

                  {/* Badge Title (Horizontal only) */}
                  {activeTab === 'horizontal' && (
                    <div>
                      <Label htmlFor="badgeTitle">Badge Title</Label>
                      <Input
                        id="badgeTitle"
                        value={values.badgeTitle}
                        onChange={(e) => setFieldValue('badgeTitle', e.target.value)}
                        placeholder="e.g., New Arrival, Hot Deals"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={values.title}
                      onChange={(e) => setFieldValue('title', e.target.value)}
                      placeholder="Advertisement title"
                    />
                    {errors.title && touched.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Discount Text */}
                  <div>
                    <Label htmlFor="discountText">
                      Discount Text {activeTab === 'vertical' && '*'}
                    </Label>
                    <Input
                      id="discountText"
                      value={values.discountText}
                      onChange={(e) => setFieldValue('discountText', e.target.value)}
                      placeholder={activeTab === 'vertical' ? '20% Off, 30% Off' : 'Get 40% Discount'}
                    />
                    {errors.discountText && touched.discountText && (
                      <p className="text-sm text-red-600 mt-1">{errors.discountText}</p>
                    )}
                  </div>

                  {/* Banner Image */}
                  <div>
                    <Label>Banner Image *</Label>
                    <FileUpload
                      accept="image/*"
                      onUpload={(url) => setFieldValue('bannerImage', url)}
                      className="mt-2"
                    />
                    {values.bannerImage && (
                      <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={values.bannerImage}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {errors.bannerImage && touched.bannerImage && (
                      <p className="text-sm text-red-600 mt-1">{errors.bannerImage}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ctaLabel">CTA Button Text</Label>
                      <Input
                        id="ctaLabel"
                        value={values.ctaLabel}
                        onChange={(e) => setFieldValue('ctaLabel', e.target.value)}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaUrl">CTA URL</Label>
                      <Input
                        id="ctaUrl"
                        value={values.ctaUrl}
                        onChange={(e) => setFieldValue('ctaUrl', e.target.value)}
                        placeholder="/products"
                      />
                      {errors.ctaUrl && touched.ctaUrl && (
                        <p className="text-sm text-red-600 mt-1">{errors.ctaUrl}</p>
                      )}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="isActive">Active Status</Label>
                      <p className="text-sm text-gray-500">Display this advertisement on the website</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={values.isActive}
                      onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : editingAd ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        {previewAd && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Advertisement Preview</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {previewAd.type === 'horizontal' ? (
                  <HorizontalAdPreview ad={previewAd} />
                ) : (
                  <VerticalAdPreview ad={previewAd} />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Advertisement?"
          description="This action cannot be undone. The advertisement will be permanently removed."
          entityName="Advertisement"
          entityCount={1}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
}

// Sortable Ad Card Component
function SortableAdCard({
  ad,
  onEdit,
  onDelete,
  onPreview
}: {
  ad: Advertisement;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ad._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        {/* Drag Handle */}
        <div
          className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between cursor-move hover:bg-gray-100 transition-colors"
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <GripVertical size={16} className="text-gray-400" />
            <span className="font-medium">Position {ad.position}</span>
          </div>
          <Badge variant={ad.isActive ? 'default' : 'secondary'} className="text-xs">
            {ad.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="relative h-48 bg-gray-100">
          <Image
            src={ad.bannerImage}
            alt={ad.title}
            fill
            className="object-cover"
          />
          {!ad.isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Inactive</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900">{ad.title}</h3>
          </div>
          {ad.badgeTitle && (
            <Badge variant="outline" className="mb-2">{ad.badgeTitle}</Badge>
          )}
          {ad.discountText && (
            <p className="text-sm text-gray-600 mb-2">{ad.discountText}</p>
          )}
          <div className="flex items-center space-x-2 mt-4">
            <Button size="sm" variant="outline" onClick={onPreview}>
              <Eye size={14} className="mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Preview Components
function HorizontalAdPreview({ ad }: { ad: Advertisement }) {
  return (
    <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
      <Image
        src={ad.bannerImage}
        alt={ad.title}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="p-8 text-white max-w-md">
          {ad.badgeTitle && (
            <Badge className="mb-3 bg-white/20 backdrop-blur-md border-white/30">
              {ad.badgeTitle}
            </Badge>
          )}
          <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{ad.title}</h2>
          {ad.discountText && (
            <p className="text-base md:text-lg mb-5 text-white/95">{ad.discountText}</p>
          )}
          {ad.cta && (
            <Button className="bg-white text-gray-900 hover:bg-gray-100">{ad.cta.label}</Button>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

function VerticalAdPreview({ ad }: { ad: Advertisement }) {
  return (
    <div className="max-w-sm mx-auto">
      <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={ad.bannerImage}
          alt={ad.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-transparent" style={{ height: '55%' }} />
        <div className="absolute inset-0 flex flex-col p-8">
          <div className="flex-shrink-0">
            {ad.discountText && (
              <h3 className="text-4xl md:text-5xl font-black mb-2 uppercase" style={{ color: '#D4A024' }}>
                {ad.discountText}
              </h3>
            )}
            <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4">{ad.title}</h4>
            {ad.cta && (
              <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                {ad.cta.label}
              </Button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  );
}
