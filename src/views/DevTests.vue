<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const notes = useLocalStorage<Note[]>('md-notes', []);
const currentNote = ref<Note | null>(null);
const isEditing = ref(false);
const showDialog = ref(false);
const deleteNoteId = ref<string | null>(null);

const searchTerm = ref('');
const filteredNotes = computed(() => {
  if (!searchTerm.value) return notes.value;
  return notes.value.filter(note => 
    note.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const createNote = () => {
  const newNote: Note = {
    id: Date.now().toString(),
    title: 'New Note',
    content: '# New Note\n\nStart writing your markdown here...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.value.unshift(newNote);
  selectNote(newNote);
  isEditing.value = true;
  showDialog.value = true;
};

const selectNote = (note: Note) => {
  currentNote.value = { ...note };
};

const saveNote = () => {
  if (!currentNote.value) return;
  
  const index = notes.value.findIndex(n => n.id === currentNote.value!.id);
  if (index !== -1) {
    notes.value[index] = {
      ...currentNote.value,
      updatedAt: new Date().toISOString()
    };
  }
  isEditing.value = false;
  showDialog.value = false;
};

const deleteNote = (noteId: string) => {
  notes.value = notes.value.filter(n => n.id !== noteId);
  if (currentNote.value?.id === noteId) {
    currentNote.value = null;
  }
  deleteNoteId.value = null;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const exportNote = (note: Note) => {
  const blob = new Blob([note.content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>
<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1>Markdown Notes</h1>
      <Button @click="createNote" class="gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <!-- Notes List -->
      <div class="md:col-span-1">
        <div class="mb-4">
          <Input
            v-model="searchTerm"
            placeholder="Search notes..."
            class="w-full"
          />
        </div>

        <div class="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
          <Card 
            v-for="note in filteredNotes" 
            :key="note.id"
            class="cursor-pointer hover:shadow-md transition-shadow"
            :class="{ 'ring-2 ring-blue-500': currentNote?.id === note.id }"
            @click="selectNote(note)"
          >
            <CardHeader class="pb-2">
              <div class="flex justify-between items-start">
                <CardTitle class="text-sm font-medium truncate">
                  {{ note.title }}
                </CardTitle>
                <div class="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click.stop="isEditing = true; showDialog = true"
                    class="h-6 w-6 p-0"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click.stop="exportNote(note)"
                    class="h-6 w-6 p-0"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        @click.stop="deleteNoteId = note.id"
                        class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{{ note.title }}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction @click="deleteNote(note.id)">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <p class="text-xs text-muted-foreground line-clamp-2">
                {{ note.content.replace(/^#.*\n/, '').substring(0, 100) }}...
              </p>
              <div class="flex justify-between items-center mt-2">
                <Badge variant="secondary" class="text-xs">
                  {{ formatDate(note.updatedAt) }}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div v-if="filteredNotes.length === 0" class="text-center text-muted-foreground py-8">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ searchTerm ? 'No notes found' : 'No notes yet. Create your first note!' }}
          </div>
        </div>
      </div>

      <!-- Note Preview -->
      <div class="md:col-span-2">
        <Card v-if="currentNote" class="h-64 md:h-96">
          <CardHeader class="pb-2">
            <div class="flex justify-between items-start">
              <CardTitle class="text-sm md:text-base truncate">{{ currentNote.title }}</CardTitle>
              <div class="flex gap-1 ml-2">
                <Button @click="isEditing = true; showDialog = true" size="sm" class="h-6 px-2 text-xs">
                  Edit
                </Button>
                <Button @click="exportNote(currentNote)" variant="outline" size="sm" class="h-6 px-2 text-xs">
                  Export
                </Button>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              Last updated: {{ formatDate(currentNote.updatedAt) }}
            </p>
          </CardHeader>
          <CardContent class="h-full overflow-hidden p-2 md:p-4">
            <div class="h-full w-full overflow-hidden">
              <MdEditor
                :model-value="currentNote.content"
                :editable="false"
                :toolbars="[]"
                preview-theme="github"
                theme="light"
                :height="200"
                class="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <div v-else class="flex items-center justify-center h-64 md:h-96 text-muted-foreground">
          <div class="text-center">
            <svg class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm md:text-lg">Select a note to preview</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-[95vw] max-h-[85vh] w-full">
        <DialogHeader>
          <DialogTitle>
            <Input
              v-if="currentNote"
              v-model="currentNote.title"
              class="text-lg font-semibold border-none p-0 h-auto"
              placeholder="Note title..."
            />
          </DialogTitle>
        </DialogHeader>
        <div class="overflow-hidden" v-if="currentNote">
          <MdEditor
            v-model="currentNote.content"
            :height="300"
            preview-theme="github"
            theme="light"
            language="en-US"
            class="w-full"
          />
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <Button variant="outline" @click="showDialog = false">Cancel</Button>
          <Button @click="saveNote">Save Note</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ensure md-editor stays within container bounds */
:deep(.md-editor) {
  max-width: 100% !important;
  overflow: hidden;
}

:deep(.md-editor-preview) {
  max-width: 100% !important;
  overflow-x: auto;
}

:deep(.md-editor-input-wrapper) {
  max-width: 100% !important;
}

/* For extension popup - single column layout on smaller screens */
@media (max-width: 767px) {
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .md\:col-span-2 {
    grid-column: span 1;
  }
  
  .md\:col-span-1 {
    grid-column: span 1;
  }
}
</style>
