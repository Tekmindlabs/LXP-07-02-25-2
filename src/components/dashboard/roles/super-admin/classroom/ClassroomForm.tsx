'use client';

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast"; 
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

interface ClassroomFormProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId?: string | null;
}

const ClassroomForm: FC<ClassroomFormProps> = ({ isOpen, onClose, classroomId }) => {
  const { toast } = useToast();
  const utils = api.useContext();
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState("");

  const { data: classroomData } = api.classroom.getById.useQuery(
    classroomId || "",
    {
      enabled: !!classroomId,
      onSuccess: (data) => {
        if (data) {
          form.reset({
            name: data.name,
            capacity: data.capacity,
          });
          try {
            const parsedResources = JSON.parse(data.resources || "[]");
            setResources(Array.isArray(parsedResources) ? parsedResources : []);
          } catch (e) {
            setResources([]);
          }
        }
      },
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: 1,
    },
  });

  const updateClassroom = api.classroom.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classroom updated successfully",
      });
      void utils.classroom.getAll.invalidate();
        onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createClassroom = api.classroom.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classroom created successfully",
      });
      void utils.classroom.getAll.invalidate();
        onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addResource = () => {
    if (newResource.trim()) {
      setResources([...resources, newResource.trim()]);
      setNewResource("");
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const payload = {
      ...data,
      resources: JSON.stringify(resources),
    };

    if (classroomId) {
      updateClassroom.mutate({ id: classroomId, ...payload });
    } else {
      createClassroom.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classroomId ? 'Edit' : 'Create'} Classroom</DialogTitle>
        </DialogHeader>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Resources</FormLabel>
          <div className="flex gap-2">
            <Input
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              placeholder="Add a resource"
            />
            <Button type="button" onClick={addResource}>
              Add
            </Button>
          </div>
          {resources.length > 0 && (
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{resource}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeResource(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
            <Button 
            type="submit" 
            disabled={createClassroom.isLoading || updateClassroom.isLoading}
            >
            {classroomId ? "Update" : "Create"} Classroom
          </Button>
        </div>
        </form>
      </Form>
        </DialogContent>
      </Dialog>
  );
};

export default ClassroomForm;