import React, { useState, useMemo } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

type TreeNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: { [key: string]: TreeNode };
  fileData?: any;
};

interface FileTreeProps {
  files: any[];
  activeFile: any;
  onSelectFile: (file: any) => void;
  onDeleteFile: (e: React.MouseEvent, path: string) => void;
}

const buildTree = (files: any[]): TreeNode => {
  const root: TreeNode = { name: 'root', path: '', type: 'folder', children: {} };
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      
      if (i === parts.length - 1) {
        current.children![part] = { name: part, path: file.path, type: 'file', fileData: file };
      } else {
        if (!current.children![part]) {
          current.children![part] = { name: part, path: parts.slice(0, i+1).join('/'), type: 'folder', children: {} };
        }
        current = current.children![part];
      }
    }
  });
  return root;
};

const FileTreeNode = ({ node, activeFile, onSelectFile, onDeleteFile, level = 0 }: { node: TreeNode, activeFile: any, onSelectFile: any, onDeleteFile: any, level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (node.type === 'folder') {
    const childrenNodes = Object.values(node.children || {}).sort((a, b) => {
      // Folders first, then alphabetically
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    return (
      <div>
        <div 
          className="flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md transition-colors text-[#c9d1d9] hover:bg-[#21262d] cursor-pointer"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-70" /> : <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
          {isOpen ? <FolderOpen className="w-4 h-4 text-[#58a6ff]" /> : <Folder className="w-4 h-4 text-[#8b949e]" />}
          <span className="truncate">{node.name}</span>
        </div>
        {isOpen && (
          <div>
            {childrenNodes.map(child => (
              <FileTreeNode key={child.path} node={child} activeFile={activeFile} onSelectFile={onSelectFile} onDeleteFile={onDeleteFile} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File
  return (
    <div className="group relative flex items-center">
      <button 
        onClick={() => onSelectFile(node.fileData)}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md transition-colors pr-8 ${activeFile?.path === node.path ? 'bg-[#238636]/10 text-[#58a6ff]' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'}`}
        style={{ paddingLeft: `${level * 12 + 26}px` }}
      >
        <FileText className="w-4 h-4 opacity-70" />
        <span className="truncate">{node.name}</span>
      </button>
      <button onClick={(e) => onDeleteFile(e, node.path)} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 rounded transition-all" title="Delete File">
         <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default function FileTree({ files, activeFile, onSelectFile, onDeleteFile }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);
  
  const rootNodes = Object.values(tree.children || {}).sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  return (
    <div className="space-y-0.5">
      {rootNodes.map(node => (
        <FileTreeNode key={node.path} node={node} activeFile={activeFile} onSelectFile={onSelectFile} onDeleteFile={onDeleteFile} level={0} />
      ))}
    </div>
  );
}
