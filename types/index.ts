// 型定義ファイル

import { Timestamp } from 'firebase/firestore';

// ユーザー型
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Timestamp;
}

// 添付ファイル型
export interface AttachedFile {
  id: string;
  fileName: string;
  fileType: string; // 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'image'
  fileSize: number; // bytes
  fileUrl: string; // Base64 encoded data or Firebase Storage URL
  storagePath?: string; // Storage内のパス (optional for Base64)
  uploadedBy: string; // userId
  uploadedAt: Timestamp;
  description?: string; // ファイルの説明
}

// ToDo項目の詳細型
export interface TodoItem {
  no: number;
  task: string; // やること
  assignee: string; // 誰が
  when: string; // いつやる（今日/明日/○曜）
  deadline: string; // 期限（○/○）
  goal: string; // ゴール（どこまで終わればOK？）
}

// 週間スケジュール型
export interface WeeklySchedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  weekend?: string;
}

// マイルストーン項目型
export interface MilestoneItem {
  label: string;
  completed: boolean;
  progress?: number; // 進捗率（0-100）
}

// 議事録型（研究室用）
export interface Minute {
  id: string;
  userId: string;
  inputMode: 'manual'; // 手入力のみ

  // 基本情報
  date: string; // YYYY-MM-DD形式
  participants: string[]; // 参加者 (default: [])

  // 発表までの日数
  midtermDate?: string; // 中間発表日（YYYY-MM-DD）
  finalDate?: string; // 最終発表日（YYYY-MM-DD）
  daysToMidterm?: number; // 中間発表まであと何日
  daysToFinal?: number; // 最終発表まであと何日
  meetingsToMidterm?: number; // 中間発表まであと何回MTG
  meetingsToFinal?: number; // 最終発表まであと何回MTG

  // 今日のゴール
  todayGoal: string; // 1行

  // Check（先週やったこと）
  lastWeekActions: string[]; // 最大3つ (default: [])

  // Problem（困ってること）
  problems: string; // 自由記述

  // Plan（次回までの予定）
  todos: TodoItem[]; // 詳細ToDoリスト (default: [])
  weeklySchedule?: WeeklySchedule; // 今週のスケジュール

  // Do（次回持っていくもの）
  nextDeliverables: {
    figures?: number; // 図
    tables?: number; // 表
    slides?: number; // スライド
    words?: number; // 文章（字数）
  };

  // Decision（決まったこと）
  decisions: string[]; // 箇条書き (default: [])

  // 次回
  nextMeetingDate?: string; // YYYY-MM-DD HH:MM
  nextMeetingGoal: string; // 次回のゴール

  // マイルストーン
  midtermMilestones: MilestoneItem[]; // 中間発表までの階段 (default: [])
  finalMilestones: MilestoneItem[]; // 最終発表までの階段 (default: [])

  // 添付ファイル
  attachedFiles: AttachedFile[]; // 関連ファイル（Word/PDF/Excel等） (default: [])

  // メタ情報
  tags: string[]; // タグ (default: [])
  status: 'draft' | 'confirmed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 編集履歴型
export interface EditHistory {
  id: string;
  minuteId: string;
  userId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  editedAt: Timestamp;
}

// 議事録作成フォーム用の型
export interface MinuteFormData {
  inputText: string; // 手入力テキスト（AI処理前）
  date: string;
  participants: string[];
  midtermDate?: string;
  finalDate?: string;
  todayGoal: string;
  lastWeekActions: string[];
  problems: string;
  todos: TodoItem[];
  weeklySchedule?: WeeklySchedule;
  nextDeliverables: {
    figures?: number;
    tables?: number;
    slides?: number;
    words?: number;
  };
  decisions: string[];
  nextMeetingDate?: string;
  nextMeetingGoal: string;
  midtermMilestones: MilestoneItem[];
  finalMilestones: MilestoneItem[];
  tags: string[];
}

// AI整理結果の型（研究室用）
export interface AIProcessedMinute {
  date: string;
  participants: string[];
  todayGoal: string;
  lastWeekActions: string[]; // 最大3つ
  problems: string;
  todos: TodoItem[];
  decisions: string[];
  nextMeetingGoal: string;
}
