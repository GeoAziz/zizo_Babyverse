'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BabyProfileForm } from "./BabyProfileForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

interface BabyProfilesListProps {
  babies: any[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function BabyProfilesList({ babies, onAdd, onUpdate, onDelete }: BabyProfilesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleAdd = async (data: any) => {
    await onAdd(data);
    setIsDialogOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedBaby) return;
    await onUpdate(selectedBaby.id, data);
    setSelectedBaby(null);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDelete(id);
      toast({
        title: "Profile Deleted",
        description: "The baby profile has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete the profile.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Baby Profiles</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Baby Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBaby ? 'Edit Baby Profile' : 'Create Baby Profile'}
              </DialogTitle>
              <DialogDescription>
                {selectedBaby 
                  ? 'Update your baby\'s profile information.'
                  : 'Add a new baby profile to get personalized recommendations.'}
              </DialogDescription>
            </DialogHeader>
            <BabyProfileForm
              baby={selectedBaby || undefined}
              onSubmit={selectedBaby ? handleUpdate : handleAdd}
              onCancel={() => {
                setSelectedBaby(null);
                setIsDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {babies.map((baby) => (
          <Card key={baby.id} className="relative">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{baby.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedBaby(baby);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {baby.name}'s profile? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(baby.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
              <CardDescription>
                {baby.ageInMonths} months old
              </CardDescription>
            </CardHeader>
            <CardContent>
              {baby.weightInKilograms && (
                <p className="text-sm text-muted-foreground">
                  Weight: {baby.weightInKilograms} kg
                </p>
              )}
              {baby.allergies && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Allergies:</span> {baby.allergies}
                </p>
              )}
              {baby.preferences && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Preferences:</span> {baby.preferences}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {
                setSelectedBaby(baby);
                setIsDialogOpen(true);
              }}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}