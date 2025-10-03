'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    FolderIcon,
    FileIcon,
    PlusIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    MoreVerticalIcon
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensors,
    useSensor,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SharedTreeItem, FileDragOverlay } from './shared-kb-tree';
import { UnifiedKbEntryModal } from './unified-kb-entry-modal';
import { KBFilePreviewModal } from './kb-file-preview-modal';
import { EditSummaryModal } from './edit-summary-modal';
import { KBDeleteConfirmDialog } from './kb-delete-confirm-dialog';
import { useKnowledgeFolders, type Folder, type Entry } from '@/hooks/react-query/knowledge-base/use-folders';
import { FileNameValidator } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const PANEL_CLASS = 'rounded-3xl border border-border/60 bg-card/80/70 shadow-[0px_18px_48px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl';
const SUBTLE_PANEL_CLASS = 'rounded-2xl border border-border/40 bg-muted/20';

interface TreeItem {
    id: string;
    type: 'folder' | 'file';
    name: string;
    parentId?: string;
    data?: Folder | Entry;
    children?: TreeItem[];
    expanded?: boolean;
}

interface KnowledgeBaseManagerProps {
    /** Optional agent context for assignment functionality */
    agentId?: string;
    agentName?: string;
    /** Show header with title and description */
    showHeader?: boolean;
    /** Custom header content */
    headerTitle?: string;
    headerDescription?: string;
    /** Show recent files section */
    showRecentFiles?: boolean;
    /** Show empty state message */
    emptyStateMessage?: string;
    /** Custom empty state content */
    emptyStateContent?: React.ReactNode;
    /** Maximum height for the tree view */
    maxHeight?: string;
    /** Enable assignment mode for agents */
    enableAssignments?: boolean;
}

export function KnowledgeBaseManager({
    agentId,
    agentName,
    showHeader = true,
    headerTitle = "Knowledge Base",
    headerDescription = "Organize documents and files for AI agents to search and reference",
    showRecentFiles = true,
    emptyStateMessage,
    emptyStateContent,
    maxHeight,
    enableAssignments = false
}: KnowledgeBaseManagerProps) {
    const [treeData, setTreeData] = useState<TreeItem[]>([]);
    const [folderEntries, setFolderEntries] = useState<{ [folderId: string]: Entry[] }>({});
    const [loadingFolders, setLoadingFolders] = useState<{ [folderId: string]: boolean }>({});
    const [movingFiles, setMovingFiles] = useState<{ [fileId: string]: boolean }>({});
    const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null);
    const [editingFolder, setEditingFolder] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // Assignment state for agent mode
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

    // Modal states
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        item: { id: string; name: string; type: 'folder' | 'file' } | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        item: null,
        isDeleting: false,
    });

    const [uploadStatus, setUploadStatus] = useState<{
        [folderId: string]: {
            isUploading: boolean;
            progress: number;
            currentFile?: string;
            totalFiles?: number;
            completedFiles?: number;
        };
    }>({});

    const [editSummaryModal, setEditSummaryModal] = useState<{
        isOpen: boolean;
        fileId: string;
        fileName: string;
        currentSummary: string;
    }>({
        isOpen: false,
        fileId: '',
        fileName: '',
        currentSummary: '',
    });

    const [filePreviewModal, setFilePreviewModal] = useState<{
        isOpen: boolean;
        file: Entry | null;
    }>({
        isOpen: false,
        file: null,
    });

    const { folders, recentFiles, loading: foldersLoading, refetch: refetchFolders } = useKnowledgeFolders();

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Build tree structure and auto-expand all folders for assignment mode
    React.useEffect(() => {
        const buildTree = () => {
            const tree: TreeItem[] = folders.map(folder => {
                const existingFolder = treeData.find(item => item.id === folder.folder_id);
                // Auto-expand all folders in assignment mode, preserve state otherwise
                const isExpanded = enableAssignments ? true : (existingFolder?.expanded || false);

                return {
                    id: folder.folder_id,
                    type: 'folder' as const,
                    name: folder.name,
                    data: folder,
                    children: folderEntries[folder.folder_id]?.map(entry => ({
                        id: entry.entry_id,
                        type: 'file' as const,
                        name: entry.filename,
                        parentId: folder.folder_id,
                        data: entry,
                    })) || [],
                    expanded: isExpanded,
                };
            });
            setTreeData(tree);
        };

        buildTree();
    }, [folders, folderEntries, enableAssignments]);

    // Load assignments and auto-fetch all folder entries for assignment mode
    React.useEffect(() => {
        if (enableAssignments && agentId) {
            console.log('Loading assignments immediately for agent:', agentId);
            loadAssignments();
            
            // Auto-fetch all folder entries in assignment mode
            if (!foldersLoading && folders.length > 0) {
                console.log('Auto-fetching all folder entries for assignment mode');
                folders.forEach(folder => {
                    if (!folderEntries[folder.folder_id]) {
                        fetchFolderEntries(folder.folder_id);
                    }
                });
            }
        }
    }, [enableAssignments, agentId, foldersLoading, folders]);

    const loadAssignments = async () => {
        if (!agentId) return;
        
        console.log('🔄 Starting to load assignments for agent:', agentId);
        setAssignmentsLoading(true);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.access_token) {
                console.warn('❌ No access token available for assignments');
                return;
            }

            console.log('📡 Fetching assignments from API...');
            const response = await fetch(`${API_URL}/knowledge-base/agents/${agentId}/assignments`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Assignments response status:', response.status);

            if (response.ok) {
                const assignments = await response.json();
                console.log('📊 Raw assignments data:', assignments);
                
                const selectedSet = new Set<string>();
                Object.entries(assignments).forEach(([entryId, enabled]) => {
                    if (enabled) {
                        selectedSet.add(entryId);
                        console.log('✅ Added to selection:', entryId);
                    } else {
                        console.log('❌ Not selected:', entryId);
                    }
                });
                console.log('🎯 Final selected entries:', Array.from(selectedSet));
                setSelectedEntries(selectedSet);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to load assignments:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Error loading assignments:', error);
        } finally {
            setAssignmentsLoading(false);
            console.log('✅ Assignment loading complete');
        }
    };

    // File handling functions
    const handleFileSelect = (item: TreeItem) => {
        if (item.type === 'file' && item.data && 'entry_id' in item.data) {
            setFilePreviewModal({
                isOpen: true,
                file: item.data,
            });
        } else {
            setSelectedItem(item);
        }
    };

    const fetchFolderEntries = async (folderId: string) => {
        setLoadingFolders(prev => ({ ...prev, [folderId]: true }));

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('No session found');
            }

            const response = await fetch(`${API_URL}/knowledge-base/folders/${folderId}/entries`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFolderEntries(prev => ({ ...prev, [folderId]: data }));
            }
        } catch (error) {
            console.error('Failed to fetch entries:', error);
        } finally {
            setLoadingFolders(prev => ({ ...prev, [folderId]: false }));
        }
    };

    const handleExpand = async (folderId: string) => {
        const folder = treeData.find(item => item.id === folderId);
        const isCurrentlyExpanded = folder?.expanded;

        setTreeData(prev =>
            prev.map(item =>
                item.id === folderId
                    ? { ...item, expanded: !item.expanded }
                    : item
            )
        );

        if (folder && !isCurrentlyExpanded && !folderEntries[folderId]) {
            await fetchFolderEntries(folderId);
        }

        if (isCurrentlyExpanded) {
            setLoadingFolders(prev => ({ ...prev, [folderId]: false }));
        }
    };

    // Assignment functions for agent mode
    const getFolderSelectionState = (folderId: string) => {
        const folder = treeData.find(f => f.id === folderId);
        if (!folder?.children || folder.children.length === 0) {
            return { selected: false, indeterminate: false };
        }

        const folderEntryIds = folder.children.map(child => child.id);
        const selectedCount = folderEntryIds.filter(id => selectedEntries.has(id)).length;

        if (selectedCount === 0) {
            return { selected: false, indeterminate: false };
        } else if (selectedCount === folderEntryIds.length) {
            return { selected: true, indeterminate: false };
        } else {
            return { selected: false, indeterminate: true };
        }
    };

    const toggleEntrySelection = async (entryId: string) => {
        const newSelection = new Set(selectedEntries);
        if (newSelection.has(entryId)) {
            newSelection.delete(entryId);
        } else {
            newSelection.add(entryId);
        }
        setSelectedEntries(newSelection);
        await saveAssignments(newSelection);
    };

    const toggleFolderSelection = async (folderId: string) => {
        const folder = treeData.find(f => f.id === folderId);
        if (!folder?.children) return;

        const folderEntryIds = folder.children.map(child => child.id);
        const allSelected = folderEntryIds.every(id => selectedEntries.has(id));

        const newSelection = new Set(selectedEntries);

        if (allSelected) {
            folderEntryIds.forEach(id => newSelection.delete(id));
        } else {
            folderEntryIds.forEach(id => newSelection.add(id));
        }

        setSelectedEntries(newSelection);
        await saveAssignments(newSelection);
    };

    const saveAssignments = async (selectedSet: Set<string>) => {
        if (!agentId) return;
        
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.access_token) return;

            const response = await fetch(`${API_URL}/knowledge-base/agents/${agentId}/assignments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ entry_ids: Array.from(selectedSet) })
            });

            if (response.ok) {
                toast.success('Knowledge base access updated');
            } else {
                throw new Error('Failed to save assignments');
            }
        } catch (error) {
            console.error('Failed to save assignments:', error);
            toast.error('Failed to save assignments');
        }
    };

    // Edit functions
    const handleStartEdit = (folderId: string, currentName: string) => {
        setEditingFolder(folderId);
        setEditingName(currentName);
        setValidationError(null);
        setTimeout(() => {
            editInputRef.current?.focus();
            editInputRef.current?.select();
        }, 0);
    };

    const handleEditChange = (newName: string) => {
        setEditingName(newName);

        const existingNames = folders
            .map(f => f.name)
            .filter(name => name !== folders.find(f => f.folder_id === editingFolder)?.name);

        const nameValidation = FileNameValidator.validateName(newName, 'folder');
        const hasConflict = nameValidation.isValid && FileNameValidator.checkNameConflict(newName, existingNames);
        const isValid = nameValidation.isValid && !hasConflict;
        const errorMessage = hasConflict
            ? 'A folder with this name already exists'
            : FileNameValidator.getFriendlyErrorMessage(newName, 'folder');

        setValidationError(isValid ? null : errorMessage);
    };

    const handleFinishEdit = async () => {
        if (!editingFolder || !editingName.trim()) {
            setEditingFolder(null);
            return;
        }

        const trimmedName = editingName.trim();
        const existingNames = folders.map(f => f.name).filter(name => name !== folders.find(f => f.folder_id === editingFolder)?.name);
        const nameValidation = FileNameValidator.validateName(trimmedName, 'folder');
        const hasConflict = nameValidation.isValid && FileNameValidator.checkNameConflict(trimmedName, existingNames);
        const isValid = nameValidation.isValid && !hasConflict;

        if (!isValid) {
            const errorMessage = hasConflict
                ? 'A folder with this name already exists'
                : FileNameValidator.getFriendlyErrorMessage(trimmedName, 'folder');
            toast.error(errorMessage);
            return;
        }

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('knowledge_base_folders')
                .update({ name: trimmedName })
                .eq('folder_id', editingFolder);

            if (error) {
                console.error('Supabase error:', error);
                if (error.message?.includes('duplicate') || error.code === '23505') {
                    toast.error('A folder with this name already exists');
                } else {
                    toast.error('Failed to rename folder');
                }
            } else {
                toast.success('Folder renamed successfully');
                refetchFolders();
            }
        } catch (error) {
            console.error('Error renaming folder:', error);
            toast.error('Failed to rename folder');
        }

        setEditingFolder(null);
        setEditingName('');
        setValidationError(null);
    };

    const handleEditKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFinishEdit();
        } else if (e.key === 'Escape') {
            setEditingFolder(null);
            setEditingName('');
            setValidationError(null);
        }
    };

    const handleEditSummary = (fileId: string, fileName: string, currentSummary: string) => {
        setEditSummaryModal({
            isOpen: true,
            fileId,
            fileName,
            currentSummary,
        });
    };

    const handleSaveSummary = async (newSummary: string) => {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('No session found');
            }

            const response = await fetch(`${API_URL}/knowledge-base/entries/${editSummaryModal.fileId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    summary: newSummary
                })
            });

            if (response.ok) {
                toast.success('Summary updated successfully');
                const fileItem = treeData.flatMap(folder => folder.children || []).find(file => file.id === editSummaryModal.fileId);
                if (fileItem?.parentId) {
                    await fetchFolderEntries(fileItem.parentId);
                }
                refetchFolders();
            } else {
                const errorData = await response.json().catch(() => null);
                toast.error(errorData?.detail || 'Failed to update summary');
            }
        } catch (error) {
            console.error('Error updating summary:', error);
            toast.error('Failed to update summary');
        }
    };

    const handleDelete = (id: string, type: 'folder' | 'file') => {
        const item = treeData.flatMap(folder => [folder, ...(folder.children || [])])
            .find(item => item.id === id);

        if (!item) return;

        setDeleteConfirm({
            isOpen: true,
            item: { id, name: item.name, type },
            isDeleting: false,
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.item) return;

        const { id, type } = deleteConfirm.item;
        setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('No session found');
            }

            const endpoint = type === 'folder'
                ? `${API_URL}/knowledge-base/folders/${id}`
                : `${API_URL}/knowledge-base/entries/${id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success(`${type === 'folder' ? 'Folder' : 'File'} deleted`);
                refetchFolders();

                if (type === 'folder') {
                    if (selectedItem?.id === id) {
                        setSelectedItem(null);
                    }
                } else {
                    const parentFolder = treeData.find(folder =>
                        folder.children?.some(child => child.id === id)
                    );
                    if (parentFolder) {
                        await fetchFolderEntries(parentFolder.id);
                    }
                }
            } else {
                toast.error(`Failed to delete ${type}`);
            }
        } catch (error) {
            toast.error(`Failed to delete ${type}`);
        } finally {
            setDeleteConfirm({
                isOpen: false,
                item: null,
                isDeleting: false,
            });
        }
    };

    const handleMoveFile = async (fileId: string, targetFolderId: string) => {
        setMovingFiles(prev => ({ ...prev, [fileId]: true }));

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('No session found');
            }

            const response = await fetch(`${API_URL}/knowledge-base/entries/${fileId}/move`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    folder_id: targetFolderId
                })
            });

            if (response.ok) {
                toast.success('File moved successfully');
                refetchFolders();
                const movedItem = treeData.flatMap(folder => folder.children || []).find(file => file.id === fileId);
                if (movedItem) {
                    await fetchFolderEntries(movedItem.parentId!);
                    await fetchFolderEntries(targetFolderId);
                }
            } else {
                toast.error('Failed to move file');
            }
        } catch (error) {
            toast.error('Failed to move file');
        } finally {
            setMovingFiles(prev => ({ ...prev, [fileId]: false }));
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setActiveId(null);
            return;
        }

        const activeItemId = active.id.toString();
        const overItemId = over.id.toString().replace('droppable-', '');

        const activeItem = treeData.flatMap(folder => [folder, ...(folder.children || [])]).find(item => item.id === activeItemId);
        const overItem = treeData.flatMap(folder => [folder, ...(folder.children || [])]).find(item => item.id === overItemId);

        if (!activeItem || !overItem) {
            setActiveId(null);
            return;
        }

        if (activeItem.type === 'file' && overItem.type === 'folder') {
            handleMoveFile(activeItem.id, overItem.id);
        }

        setActiveId(null);
    };

    // Handle file drops
    const handleNativeFileDrop = async (files: FileList, folderId: string) => {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('No session found');
            }

            const fileArray = Array.from(files);
            const totalFiles = fileArray.length;

            setUploadStatus(prev => ({
                ...prev,
                [folderId]: {
                    isUploading: true,
                    progress: 0,
                    totalFiles,
                    completedFiles: 0,
                    currentFile: fileArray[0]?.name
                }
            }));

            let successCount = 0;

            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];

                const validation = FileNameValidator.validateName(file.name, 'file');
                if (!validation.isValid) {
                    toast.error(`Invalid filename "${file.name}": ${FileNameValidator.getFriendlyErrorMessage(file.name, 'file')}`);
                    continue;
                }

                setUploadStatus(prev => ({
                    ...prev,
                    [folderId]: {
                        ...prev[folderId],
                        currentFile: file.name,
                        progress: (i / totalFiles) * 100
                    }
                }));

                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch(`${API_URL}/knowledge-base/folders/${folderId}/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        successCount++;

                        if (result.filename_changed) {
                            toast.info(`File "${result.original_filename}" was renamed to "${result.final_filename}" to avoid conflicts`);
                        }
                    } else {
                        if (response.status === 413) {
                            try {
                                const errorData = await response.json();
                                toast.error(`Knowledge base limit exceeded: ${errorData.detail || 'Total file size limit (50MB) exceeded'}`);
                            } catch {
                                toast.error('Knowledge base limit exceeded: Total file size limit (50MB) exceeded');
                            }
                        } else {
                            toast.error(`Failed to upload ${file.name}: Error ${response.status}`);
                        }
                    }
                } catch (error) {
                    toast.error(`Error uploading ${file.name}`);
                }

                setUploadStatus(prev => ({
                    ...prev,
                    [folderId]: {
                        ...prev[folderId],
                        completedFiles: i + 1,
                        progress: ((i + 1) / totalFiles) * 100
                    }
                }));
            }

            setTimeout(() => {
                setUploadStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[folderId];
                    return newStatus;
                });
            }, 3000);

            if (successCount === totalFiles) {
                toast.success(`Successfully uploaded ${successCount} file(s)`);
            } else if (successCount > 0) {
                toast.success(`Uploaded ${successCount} of ${totalFiles} files`);
            }

            refetchFolders();
            await fetchFolderEntries(folderId);

        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload files');

            setUploadStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[folderId];
                return newStatus;
            });
        }
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getFileTypeInfo = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        const fileType = extension.toUpperCase();

        const getTypeColor = (ext: string) => {
            switch (ext) {
                case 'pdf': return 'bg-red-100 text-red-700 border-red-200';
                case 'doc':
                case 'docx': return 'bg-blue-100 text-blue-700 border-blue-200';
                case 'ppt':
                case 'pptx': return 'bg-orange-100 text-orange-700 border-orange-200';
                case 'xls':
                case 'xlsx': return 'bg-green-100 text-green-700 border-green-200';
                case 'txt': return 'bg-gray-100 text-gray-700 border-gray-200';
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif': return 'bg-purple-100 text-purple-700 border-purple-200';
                default: return 'bg-slate-100 text-slate-700 border-slate-200';
            }
        };

        return {
            extension: fileType,
            colorClass: getTypeColor(extension)
        };
    };

    if (foldersLoading || (enableAssignments && assignmentsLoading)) {
        return (
            <div className="space-y-6">
                {showHeader && (
                    <div className={cn(PANEL_CLASS, 'px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                        <Skeleton className="h-9 w-32 rounded-2xl" />
                    </div>
                )}

                <div className={cn(PANEL_CLASS, 'px-4 sm:px-6 py-6 space-y-4')}>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/30 bg-card/60">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-10 w-10 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        {enableAssignments && <Skeleton className="h-5 w-10 rounded-full" />}
                        <Skeleton className="h-6 w-6 rounded-lg" />
                    </div>

                    <div className="ml-6 space-y-3">
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/20 bg-card/50">
                            <Skeleton className="h-9 w-9 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-44" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                            {enableAssignments && <Skeleton className="h-5 w-10 rounded-full" />}
                            <Skeleton className="h-6 w-6 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/20 bg-card/50">
                            <Skeleton className="h-9 w-9 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            {enableAssignments && <Skeleton className="h-5 w-10 rounded-full" />}
                            <Skeleton className="h-6 w-6 rounded-lg" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/30 bg-card/60">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-10 w-10 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        {enableAssignments && <Skeleton className="h-5 w-10 rounded-full" />}
                        <Skeleton className="h-6 w-6 rounded-lg" />
                    </div>

                    <div className="ml-6 space-y-3">
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/20 bg-card/50">
                            <Skeleton className="h-9 w-9 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            {enableAssignments && <Skeleton className="h-5 w-10 rounded-full" />}
                            <Skeleton className="h-6 w-6 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const defaultEmptyMessage = enableAssignments 
        ? `No knowledge base content available. Create folders and upload files to provide ${agentName} with searchable knowledge.`
        : "Start building your knowledge base by creating folders and uploading files.";

    return (
        <div className="space-y-6">
            {showHeader && (
                <div className={cn(PANEL_CLASS, 'px-6 py-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between')}>
                    <div className="space-y-1.5">
                        <h3 className="text-lg font-semibold text-foreground">{headerTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                            {enableAssignments ? `Manage ${agentName}'s knowledge sources and access` : headerDescription}
                        </p>
                    </div>
                    <UnifiedKbEntryModal
                        folders={folders}
                        onUploadComplete={() => {
                            refetchFolders();
                            if (enableAssignments) {
                                loadAssignments();
                            }
                        }}
                        trigger={
                            <Button size="sm" className="gap-2 rounded-xl shadow-[0_12px_24px_-18px_rgba(15,23,42,0.5)]">
                                <PlusIcon className="h-4 w-4" />
                                Add Knowledge
                            </Button>
                        }
                    />
                </div>
            )}

            {showRecentFiles && recentFiles.length > 0 && (
                <div className={cn(PANEL_CLASS, 'px-6 py-5 space-y-6')}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">Recently Added</h3>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
                            {recentFiles.length} files
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {recentFiles.slice(0, 6).map((file) => {
                            const fileInfo = getFileTypeInfo(file.filename);
                            return (
                                <button
                                    type="button"
                                    key={file.entry_id}
                                    className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card/80 px-4 py-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-border/70 hover:shadow-[0_16px_32px_-24px_rgba(15,23,42,0.65)]"
                                    onClick={() => setFilePreviewModal({
                                        isOpen: true,
                                        file,
                                    })}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-background flex items-center justify-center">
                                            <FileIcon className="h-6 w-6 text-foreground/70" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 rounded-md border border-border/60 bg-background/90 px-1.5 py-0.5">
                                            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                {fileInfo.extension.slice(0, 3)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-center w-full">
                                        <p className="text-xs font-medium text-foreground truncate" title={file.filename}>
                                            {file.filename.length > 18 ? `${file.filename.slice(0, 18)}…` : file.filename}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {formatDate(file.created_at)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={cn(PANEL_CLASS, 'px-3 sm:px-5 md:px-6 py-6')}>
                <div
                    className="space-y-4"
                    style={{ maxHeight }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                >
                    {treeData.length === 0 ? (
                        emptyStateContent ? emptyStateContent : (
                            <div className="text-center py-12 px-6 border border-dashed border-border/50 rounded-3xl bg-card/60 backdrop-blur-lg">
                                <div className="mx-auto w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center mb-4 border border-border/60">
                                    <FolderIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                    {enableAssignments ? "No knowledge base content available" : "Start Building Your Knowledge Base"}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                    {emptyStateMessage || defaultEmptyMessage}
                                </p>
                                <UnifiedKbEntryModal
                                    folders={folders}
                                    onUploadComplete={() => {
                                        refetchFolders();
                                        if (enableAssignments) {
                                            loadAssignments();
                                        }
                                    }}
                                    trigger={
                                        <Button size="sm" className="gap-2 rounded-xl shadow-[0_12px_24px_-18px_rgba(15,23,42,0.5)]">
                                            <PlusIcon className="h-4 w-4" />
                                            Add Knowledge
                                        </Button>
                                    }
                                />
                            </div>
                        )
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={treeData.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                            <div className="space-y-3">
                                {treeData.map((item) => {
                                    // Build assignments for assignment mode
                                    const allAssignments: { [id: string]: boolean } = {};
                                    const allIndeterminateStates: { [id: string]: boolean } = {};

                                    if (enableAssignments) {
                                        // Add all files from all folders
                                        treeData.forEach(folder => {
                                            if (folder.children) {
                                                folder.children.forEach(child => {
                                                    allAssignments[child.id] = selectedEntries.has(child.id);
                                                });
                                            }
                                        });

                                        // Add folder states
                                        treeData.forEach(folder => {
                                            const folderState = getFolderSelectionState(folder.id);
                                            allAssignments[folder.id] = folderState.selected;
                                            if (folderState.indeterminate) {
                                                allIndeterminateStates[folder.id] = true;
                                            }
                                        });
                                    }

                                    return (
                                        <SharedTreeItem
                                            key={item.id}
                                            item={item}
                                            onExpand={handleExpand}
                                            onSelect={handleFileSelect}
                                            enableDnd={true}
                                            enableActions={true}
                                            enableEdit={!enableAssignments} // Only allow editing in main KB page
                                            enableAssignment={enableAssignments}
                                            assignments={enableAssignments ? allAssignments : undefined}
                                            assignmentIndeterminate={enableAssignments ? allIndeterminateStates : undefined}
                                            onToggleAssignment={enableAssignments ? (id) => {
                                                const targetItem = treeData.find(f => f.id === id) ||
                                                    treeData.flatMap(f => f.children || []).find(c => c.id === id);
                                                if (targetItem?.type === 'folder') {
                                                    toggleFolderSelection(id);
                                                } else {
                                                    toggleEntrySelection(id);
                                                }
                                            } : undefined}
                                            onDelete={handleDelete}
                                            onEditSummary={handleEditSummary}
                                            editingFolder={editingFolder}
                                            editingName={editingName}
                                            onStartEdit={handleStartEdit}
                                            onFinishEdit={handleFinishEdit}
                                            onEditChange={handleEditChange}
                                            onEditKeyPress={handleEditKeyPress}
                                            editInputRef={editInputRef}
                                            onNativeFileDrop={handleNativeFileDrop}
                                            uploadStatus={uploadStatus[item.id]}
                                            validationError={editingFolder === item.id ? validationError : null}
                                            isLoadingEntries={loadingFolders[item.id]}
                                            movingFiles={movingFiles}
                                        />
                                    );
                                })}
                            </div>
                            </SortableContext>

                            <DragOverlay>
                                {activeId ? (() => {
                                    const findActiveItem = (items: TreeItem[]): TreeItem | null => {
                                        for (const item of items) {
                                            if (item.id === activeId) return item;
                                            if (item.children) {
                                                const found = findActiveItem(item.children);
                                                if (found) return found;
                                            }
                                        }
                                        return null;
                                    };

                                    const activeItem = findActiveItem(treeData);

                                    if (activeItem?.type === 'file') {
                                        return <FileDragOverlay item={activeItem} />;
                                    } else {
                                        return (
                                            <div className="bg-background border rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <FolderIcon className="h-4 w-4" />
                                                    <span className="font-medium text-sm">
                                                        {activeItem?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })() : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Modals */}
            <KBDeleteConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, item: null, isDeleting: false })}
                onConfirm={confirmDelete}
                itemName={deleteConfirm.item?.name || ''}
                itemType={deleteConfirm.item?.type || 'file'}
                isDeleting={deleteConfirm.isDeleting}
            />

            <EditSummaryModal
                isOpen={editSummaryModal.isOpen}
                onClose={() => setEditSummaryModal({ isOpen: false, fileId: '', fileName: '', currentSummary: '' })}
                fileName={editSummaryModal.fileName}
                currentSummary={editSummaryModal.currentSummary}
                onSave={handleSaveSummary}
            />

            {filePreviewModal.file && (
                <KBFilePreviewModal
                    isOpen={filePreviewModal.isOpen}
                    onClose={() => setFilePreviewModal({ isOpen: false, file: null })}
                    file={filePreviewModal.file}
                    onEditSummary={handleEditSummary}
                />
            )}
        </div>
    );
}
