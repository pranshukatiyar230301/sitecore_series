import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Loader2, Trash2, Pencil, Plus, ArrowLeft, Filter, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job, InsertJob } from "@shared/schema";

export function JobsManager() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  
  const [formData, setFormData] = useState<InsertJob>({
    companyName: "",
    title: "",
    description: "",
    jobType: "",
    location: "",
    applyUrl: "",
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({ queryKey: ["/api/jobs"] });
  const token = localStorage.getItem("ss_admin_token") || "";

  const availableJobTypes = useMemo(() => {
    if (!jobs) return [];
    const types = new Set(jobs.map(j => j.jobType));
    return Array.from(types);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (selectedJobType === "all") return jobs;
    return jobs.filter(j => j.jobType === selectedJobType);
  }, [jobs, selectedJobType]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertJob) => {
      const url = editingId ? `/api/admin/jobs/${editingId}` : "/api/admin/jobs";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save job");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: editingId ? "Job Updated Successfully" : "Job Published Successfully" });
      closeFormAndReset();
    },
    onError: (error: any) => {
      toast({ title: "Error saving job", description: error?.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job Deleted" });
    },
    onError: () => {
      toast({ title: "Error deleting job", variant: "destructive" });
    },
  });

  function closeFormAndReset() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ companyName: "", title: "", description: "", jobType: "Full-Time", location: "Remote", applyUrl: "" });
  }

  function handleOpenCreateForm() {
    setEditingId(null);
    setFormData({ companyName: "", title: "", description: "", jobType: "Full-Time", location: "Remote", applyUrl: "" });
    setIsFormOpen(true);
  }

  function handleOpenEditForm(job: Job) {
    setEditingId(job.id);
    setFormData({
      companyName: job.companyName,
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      location: job.location,
      applyUrl: job.applyUrl,
    });
    setIsFormOpen(true);
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // View 1: Active Listings Overview with Blog-style Filter Bar[cite: 2]
  if (!isFormOpen) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-3xl border border-border/80 p-4 flex items-center gap-3 flex-wrap shadow-xs">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-foreground">Filter by type:</span>
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="px-3.5 py-1.5 rounded-full border border-border bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="all">All types ({jobs?.length || 0})</option>
            {availableJobTypes.map((type) => (
              <option key={type} value={type}>
                {type} ({jobs?.filter(j => j.jobType === type).length || 0})
              </option>
            ))}
          </select>
          <Button 
            onClick={handleOpenCreateForm} 
            className="ml-auto rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm text-xs sm:text-sm font-bold px-4"
            data-testid="button-create-job"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Job
          </Button>
        </div>

        <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold mb-4 font-display">Manage Active Listings</h3>
          {!filteredJobs || filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">No job listings found.</p>
              <Button onClick={handleOpenCreateForm} variant="outline" className="rounded-xl text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Post New Job
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((j) => (
                <div key={j.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:border-border/80 transition-all">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {j.jobType}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-foreground">{j.title}</h4>
                    <p className="text-xs text-muted-foreground">{j.companyName} • {j.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenEditForm(j)} 
                      className="rounded-xl"
                      title="Edit job"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => { if (confirm(`Delete job "${j.title}"?`)) deleteMutation.mutate(j.id); }} 
                      className="text-destructive hover:bg-destructive/10 rounded-xl"
                      title="Delete job"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View 2: Job Creation / Edit Form Editor View
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={closeFormAndReset}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer mb-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Active Listings
      </button>

      <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 font-display">
          {editingId ? `Edit Job Opening (#${editingId})` : "Post New Sitecore Job"}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                placeholder="e.g. Sitecore / Tech Partners"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                placeholder="e.g. Senior Sitecore XM Cloud Architect"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Job Type</label>
              <input
                type="text"
                required
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                placeholder="Full-Time / Contract"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                placeholder="Remote / London, UK"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Apply URL</label>
              <input
                type="url"
                required
                value={formData.applyUrl}
                onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                placeholder="https://company.com/careers/apply"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Job Description (Rich Text)</label>
            <RichTextEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Enter role requirements, responsibilities, and details..."
              minHeight={250}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "Update Job" : "Publish Job"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeFormAndReset}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}