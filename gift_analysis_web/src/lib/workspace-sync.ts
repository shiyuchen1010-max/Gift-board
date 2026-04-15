import type { GiftRecord, ManualBadgeReviewItem } from '../types/gift';
import {
  buildPatchedBindings,
  buildPatchedRecognitionReport,
  sortManualReviewItems,
  type BadgeRecognitionReport,
  type GiftBadgeBinding,
} from './manual-review';

type PermissionMode = 'read' | 'readwrite';
type PermissionStateValue = 'granted' | 'denied' | 'prompt';

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: PermissionMode }) => Promise<FileSystemDirectoryHandle>;
};

type WritableDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (descriptor?: { mode?: PermissionMode }) => Promise<PermissionStateValue>;
  requestPermission?: (descriptor?: { mode?: PermissionMode }) => Promise<PermissionStateValue>;
};

const REVIEW_FILE_TARGETS = [
  ['gift_analysis_config', 'manual_badge_reviews.json'],
  ['gift_analysis_web', 'public', 'data', 'manual_badge_reviews.json'],
  ['docs', 'data', 'manual_badge_reviews.json'],
] as const;

const GIFT_FILE_TARGETS = [
  ['gift_analysis_web', 'public', 'data', 'gifts.json'],
  ['docs', 'data', 'gifts.json'],
] as const;

const REPORT_FILE_TARGETS = [
  ['gift_analysis_web', 'public', 'data', 'badge_recognition_report.json'],
  ['docs', 'data', 'badge_recognition_report.json'],
] as const;

const BINDINGS_FILE_TARGET = ['gift_analysis_config', 'gift_badge_bindings.json'] as const;

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '发生了未知错误';
}

function pathToLabel(pathSegments: readonly string[]): string {
  return pathSegments.join('/');
}

async function ensurePermission(handle: WritableDirectoryHandle): Promise<void> {
  const descriptor = { mode: 'readwrite' as const };
  const current = await handle.queryPermission?.(descriptor);
  if (current === 'granted') {
    return;
  }
  const requested = await handle.requestPermission?.(descriptor);
  if (requested !== 'granted') {
    throw new Error('没有获得本地目录写入权限，请在浏览器弹窗中允许访问。');
  }
}

async function getDirectoryHandleByPath(
  rootHandle: FileSystemDirectoryHandle,
  pathSegments: readonly string[],
  create = false,
): Promise<FileSystemDirectoryHandle> {
  let current = rootHandle;
  for (const segment of pathSegments) {
    current = await current.getDirectoryHandle(segment, { create });
  }
  return current;
}

async function getFileHandleByPath(
  rootHandle: FileSystemDirectoryHandle,
  pathSegments: readonly string[],
  create = false,
): Promise<FileSystemFileHandle> {
  const directory = await getDirectoryHandleByPath(rootHandle, pathSegments.slice(0, -1), create);
  return directory.getFileHandle(pathSegments[pathSegments.length - 1], { create });
}

async function readJsonFile<T>(rootHandle: FileSystemDirectoryHandle, pathSegments: readonly string[]): Promise<T | null> {
  try {
    const fileHandle = await getFileHandleByPath(rootHandle, pathSegments, false);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(rootHandle: FileSystemDirectoryHandle, pathSegments: readonly string[], data: unknown): Promise<void> {
  const fileHandle = await getFileHandleByPath(rootHandle, pathSegments, true);
  const writable = await fileHandle.createWritable();
  await writable.write(`${JSON.stringify(data, null, 2)}\n`);
  await writable.close();
}

async function validateWorkspaceStructure(rootHandle: FileSystemDirectoryHandle): Promise<void> {
  try {
    await getDirectoryHandleByPath(rootHandle, ['gift_analysis_config']);
    await getDirectoryHandleByPath(rootHandle, ['gift_analysis_web', 'public', 'data']);
    await getDirectoryHandleByPath(rootHandle, ['docs', 'data']);
  } catch (error) {
    throw new Error('所选文件夹不正确。请务必选择项目的根目录（即 20260410162015），而不要选择 extracted_gifts 等子文件夹。');
  }
}

export function supportsWorkspaceDirectorySync(): boolean {
  // Always return true now, because we have a fallback to the local API
  return true;
}

export async function pickWorkspaceDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
  if (!picker) {
    // Return null, indicating we should rely on the local API fallback instead
    return null;
  }

  const handle = await picker({ mode: 'readwrite' });
  await ensurePermission(handle as WritableDirectoryHandle);
  await validateWorkspaceStructure(handle);
  return handle;
}

export async function saveWorkspaceReviewFiles(options: {
  rootHandle: FileSystemDirectoryHandle | null;
  manualReviews: ManualBadgeReviewItem[];
  gifts: GiftRecord[];
}): Promise<{ writtenFiles: string[] }> {
  const { rootHandle, manualReviews, gifts } = options;
  const sortedReviews = sortManualReviewItems(manualReviews);

  // Try the Vite dev server local API first
  try {
    const response = await fetch('/api/save-workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manualReviews: sortedReviews, gifts }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.writtenFiles) {
        return { writtenFiles: data.writtenFiles };
      }
    } else {
      const errorData = await response.json();
      if (errorData && errorData.error) {
         console.error('Local API Error:', errorData.error);
      }
    }
  } catch (err) {
    console.warn('Local API not available, falling back to File System Access API', err);
  }

  // Fallback to File System Access API
  if (!rootHandle) {
    throw new Error('当前环境暂不支持直接保存到项目目录，请切换到支持的本地浏览环境后重试。');
  }

  const [existingBindings, publicReport, docsReport] = await Promise.all([
    readJsonFile<GiftBadgeBinding[]>(rootHandle, BINDINGS_FILE_TARGET),
    readJsonFile<BadgeRecognitionReport>(rootHandle, REPORT_FILE_TARGETS[0]),
    readJsonFile<BadgeRecognitionReport>(rootHandle, REPORT_FILE_TARGETS[1]),
  ]);

  const nextBindings = existingBindings ? buildPatchedBindings(existingBindings, sortedReviews) : null;
  const nextPublicReport = buildPatchedRecognitionReport(publicReport ?? {}, sortedReviews, gifts);
  const nextDocsReport = buildPatchedRecognitionReport(docsReport ?? {}, sortedReviews, gifts);

  const writes: Array<Promise<void>> = [];
  const writtenFiles: string[] = [];

  for (const target of REVIEW_FILE_TARGETS) {
    writes.push(writeJsonFile(rootHandle, target, sortedReviews));
    writtenFiles.push(pathToLabel(target));
  }

  for (const target of GIFT_FILE_TARGETS) {
    writes.push(writeJsonFile(rootHandle, target, gifts));
    writtenFiles.push(pathToLabel(target));
  }

  writes.push(writeJsonFile(rootHandle, REPORT_FILE_TARGETS[0], nextPublicReport));
  writes.push(writeJsonFile(rootHandle, REPORT_FILE_TARGETS[1], nextDocsReport));
  writtenFiles.push(pathToLabel(REPORT_FILE_TARGETS[0]), pathToLabel(REPORT_FILE_TARGETS[1]));

  if (nextBindings) {
    writes.push(writeJsonFile(rootHandle, BINDINGS_FILE_TARGET, nextBindings));
    writtenFiles.push(pathToLabel(BINDINGS_FILE_TARGET));
  }

  try {
    await Promise.all(writes);
    return { writtenFiles };
  } catch (error) {
    throw new Error(`写回本地项目失败：${normalizeError(error)}`);
  }
}
