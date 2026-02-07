"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import {
  Undo2,
  Redo2,
  SplitSquareVertical,
  SplitSquareHorizontal,
  RotateCcw,
  Square,
} from "lucide-react";
import { useDescriptionsQuery, useSeriesQuery, useSystemsQuery } from "@/lib/quotations/queries";
import type { Description } from "@/lib/quotations/types";

type SplitDirection = "none" | "vertical" | "horizontal";
type SystemType = "Casement" | "Sliding" | "Slide N Fold";
type SashType = "fixed" | "left" | "right" | "double" | "top" | "bottom";

type SectionNode = {
  id: string;
  x: number; // 0-1
  y: number; // 0-1
  w: number; // 0-1
  h: number; // 0-1
  split: SplitDirection;
  ratio: number;
  sash: SashType;
  systemType: SystemType;
  series: string;
  description: string;
  panelFractions?: number[];
  panelMeshCount?: number;
  glass: "Yes" | "No";
  mesh: "Yes" | "No";
  children?: SectionNode[];
};

type ProductMeta = {
  productType: "Window" | "Door";
  systemType: string;
  series: string;
  description: string;
  colorFinish: string;
  glassSpec: string;
  handleType: string;
  handleColor: string;
  meshPresent: string;
  meshType: string;
  location: string;
  quantity: number;
};

type AddItemPayload = {
  widthMm: number;
  heightMm: number;
  areaSqft: number;
  refImage: string;
  meta: ProductMeta;
  subItems?: Array<{
    widthMm: number;
    heightMm: number;
    areaSqft: number;
    systemType: SystemType;
    series: string;
    description: string;
    glass: "Yes" | "No";
    mesh: "Yes" | "No";
  }>;
};

const DEFAULT_META: ProductMeta = {
  productType: "Window",
  systemType: "Casement",
  series: "",
  description: "",
  colorFinish: "",
  glassSpec: "",
  handleType: "",
  handleColor: "",
  meshPresent: "No",
  meshType: "",
  location: "",
  quantity: 1,
};

const createRoot = (baseSystem: SystemType): SectionNode => ({
  id: "root",
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  split: "none",
  ratio: 0.5,
  sash: "fixed",
  systemType: baseSystem,
  series: "",
  description: "",
  glass: "No",
  mesh: "No",
});

const createLeaf = (
  x: number,
  y: number,
  w: number,
  h: number,
  sash: SashType,
  systemType: SystemType,
  glass: "Yes" | "No",
  mesh: "Yes" | "No"
): SectionNode => ({
  id: crypto.randomUUID(),
  x,
  y,
  w,
  h,
  split: "none",
  ratio: 0.5,
  sash,
  systemType,
  series: "",
  description: "",
  glass,
  mesh,
});

const buildPreset = (systemType: SystemType, glass: "Yes" | "No", mesh: "Yes" | "No"): SectionNode => {
  const root: SectionNode = { ...createRoot(systemType), glass, mesh };

  if (systemType === "Sliding") {
    root.split = "vertical";
    root.children = [
      createLeaf(0, 0, 0.5, 1, "left", "Sliding", glass, mesh),
      createLeaf(0.5, 0, 0.5, 1, "right", "Sliding", glass, mesh),
    ];
    return root;
  }

  if (systemType === "Slide N Fold") {
    root.split = "vertical";
    root.children = [
      createLeaf(0, 0, 1 / 3, 1, "right", "Slide N Fold", glass, mesh),
      createLeaf(1 / 3, 0, 1 / 3, 1, "right", "Slide N Fold", glass, mesh),
      createLeaf(2 / 3, 0, 1 / 3, 1, "right", "Slide N Fold", glass, mesh),
    ];
    return root;
  }

  root.sash = "double";
  return root;
};

const cloneTree = (node: SectionNode): SectionNode => JSON.parse(JSON.stringify(node)) as SectionNode;

const findParent = (node: SectionNode, id: string): SectionNode | null => {
  for (const child of node.children ?? []) {
    if (child.id === id) return node;
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
};

const findNode = (node: SectionNode, id: string): SectionNode | null => {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

const mapLeafNodes = (node: SectionNode, cb: (leaf: SectionNode) => void) => {
  if (!node.children || node.children.length === 0) {
    cb(node);
    return;
  }
  node.children.forEach((child) => mapLeafNodes(child, cb));
};

const buildSplitChildren = (
  node: SectionNode,
  direction: SplitDirection,
  baseSystemType: SystemType,
  baseGlass: "Yes" | "No",
  baseMesh: "Yes" | "No",
  count: number
): SectionNode[] => {
  const safeCount = Math.max(2, Math.min(count, 5));

  if (direction === "vertical") {
    const slice = node.w / safeCount;
    return Array.from({ length: safeCount }, (_, idx) => {
      const leaf = createLeaf(
        node.x + slice * idx,
        node.y,
        slice,
        node.h,
        idx === 0 ? node.sash : "fixed",
        idx === 0 ? node.systemType : baseSystemType,
        idx === 0 ? node.glass : baseGlass,
        idx === 0 ? node.mesh : baseMesh
      );
      if (idx === 0) {
        leaf.series = node.series;
        leaf.description = node.description;
        leaf.panelFractions = node.panelFractions;
        leaf.panelMeshCount = node.panelMeshCount;
      }
      return leaf;
    });
  }

  const slice = node.h / safeCount;
  return Array.from({ length: safeCount }, (_, idx) => {
    const leaf = createLeaf(
      node.x,
      node.y + slice * idx,
      node.w,
      slice,
      idx === 0 ? node.sash : "fixed",
      idx === 0 ? node.systemType : baseSystemType,
      idx === 0 ? node.glass : baseGlass,
      idx === 0 ? node.mesh : baseMesh
    );
    if (idx === 0) {
      leaf.series = node.series;
      leaf.description = node.description;
      leaf.panelFractions = node.panelFractions;
      leaf.panelMeshCount = node.panelMeshCount;
    }
    return leaf;
  });
};

const mmToSqft = (wMm: number, hMm: number) => {
  const wFt = wMm / 304.8;
  const hFt = hMm / 304.8;
  return Number((wFt * hFt).toFixed(2));
};

const getImagePath = (description: string): string => {
  if (!description) return "";
  if (description === "Fix") return "/Quotations/Fix.png";
  if (description === "French Door" || description === "French Window")
    return "/Quotations/French Door-Window.jpg";
  if (description === "Left Openable Window" || description === "Left Openable Door")
    return "/Quotations/Left Openable Door-Window.jpg";
  if (description === "Right Openable Window" || description === "Right Openable Door")
    return "/Quotations/Right Openable Door-Window.jpg";
  return `/Quotations/${description}.jpg`;
};


const drawSashGlyph = (
  group: Konva.Group,
  x: number,
  y: number,
  w: number,
  h: number,
  type: SashType,
  color: string
) => {
  const inset = Math.min(w, h) * 0.18;
  const left = x + inset;
  const right = x + w - inset;
  const top = y + inset;
  const bottom = y + h - inset;
  const midX = x + w / 2;
  const midY = y + h / 2;

  if (type === "double") {
    group.add(new Konva.Line({ points: [left, top, midX, midY, left, bottom], stroke: color, strokeWidth: 2, listening: false }));
    group.add(new Konva.Line({ points: [right, top, midX, midY, right, bottom], stroke: color, strokeWidth: 2, listening: false }));
  } else if (type === "left") {
    group.add(new Konva.Line({ points: [left, top, right, midY, left, bottom], stroke: color, strokeWidth: 2, listening: false }));
  } else if (type === "right") {
    group.add(new Konva.Line({ points: [right, top, left, midY, right, bottom], stroke: color, strokeWidth: 2, listening: false }));
  } else if (type === "top") {
    group.add(new Konva.Line({ points: [left, top, midX, bottom, right, top], stroke: color, strokeWidth: 2, listening: false }));
  } else if (type === "bottom") {
    group.add(new Konva.Line({ points: [left, bottom, midX, top, right, bottom], stroke: color, strokeWidth: 2, listening: false }));
  }
};

const parsePanelPattern = (desc: string): { fractions: number[]; meshCount?: number } | null => {
  const panelGroup = desc.match(/(\d+)\s*Panel\s*\((\d+)\+(\d+)\)/i);
  if (panelGroup) {
    const left = Number(panelGroup[2]);
    const right = Number(panelGroup[3]);
    const total = left + right;
    return { fractions: [left / total, right / total] };
  }

  const panelCount = desc.match(/^(\d+)\s*Panel/i);
  if (panelCount) {
    const count = Number(panelCount[1]);
    return { fractions: Array.from({ length: count }, () => 1 / count) };
  }

  const trackPanels = desc.match(/(\d+)\s*Track\s+(\d+)\s*Glass/i);
  if (trackPanels) {
    const count = Number(trackPanels[2]);
    const meshMatch = desc.match(/(\d+)\s*Mesh/i);
    return { fractions: Array.from({ length: count }, () => 1 / count), meshCount: meshMatch ? Number(meshMatch[1]) : 0 };
  }

  const glassMeshCombo = desc.match(/(\d+)\s*Glass.*(\d+)\s*Mesh/i);
  if (glassMeshCombo) {
    const glass = Number(glassMeshCombo[1]);
    const mesh = Number(glassMeshCombo[2]);
    const total = glass + mesh;
    return { fractions: Array.from({ length: total }, () => 1 / total), meshCount: mesh };
  }

  return null;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** ===== history with “direct set” for live dragging ===== */
const useHistory = (initial: SectionNode) => {
  const [past, setPast] = useState<SectionNode[]>([]);
  const [present, setPresent] = useState<SectionNode>(initial);
  const [future, setFuture] = useState<SectionNode[]>([]);

  const push = useCallback(
    (next: SectionNode) => {
      setPast((prev) => [...prev, cloneTree(present)]);
      setPresent(cloneTree(next));
      setFuture([]);
    },
    [present]
  );

  const setDirect = useCallback((next: SectionNode) => {
    setPresent(cloneTree(next));
  }, []);

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      setFuture((f) => [cloneTree(present), ...f]);
      const next = prev[prev.length - 1];
      setPresent(cloneTree(next));
      return prev.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      setPast((p) => [...p, cloneTree(present)]);
      const next = prev[0];
      setPresent(cloneTree(next));
      return prev.slice(1);
    });
  }, [present]);

  const reset = useCallback((node: SectionNode) => {
    setPast([]);
    setPresent(cloneTree(node));
    setFuture([]);
  }, []);

  return { past, present, future, push, setDirect, undo, redo, reset };
};

/** ===== style ===== */
const COLORS = {
  bg: "#F8FAFC",
  grid: "#E2E8F0",
  frameDark: "#111827",
  frameMid: "#374151",
  frameLight: "#9CA3AF",
  glass: "#BFEAF6",
  glassStroke: "#64748B",
  labelStroke: "#111827",
  labelFill: "#FFFFFF",
  mesh: "#CBD5E1", // light gray mesh
  text: "#0F172A",
  selected: "#F97316",
  handleStroke: "#0F172A",
};

const PROFILE = {
  outer: 10,
  inner: 4,
  mullion: 12,
  sash: 6,
  gap: 2,
};

function addProfileRect(layer: Konva.Layer | Konva.Group, x: number, y: number, w: number, h: number, selected = false) {
  layer.add(new Konva.Rect({ x, y, width: w, height: h, stroke: selected ? COLORS.selected : COLORS.frameDark, strokeWidth: PROFILE.outer, listening: false }));
  layer.add(new Konva.Rect({ x: x + PROFILE.outer / 2 + 2, y: y + PROFILE.outer / 2 + 2, width: w - (PROFILE.outer + 4), height: h - (PROFILE.outer + 4), stroke: COLORS.frameMid, strokeWidth: PROFILE.inner, listening: false }));
  layer.add(new Konva.Rect({ x: x + PROFILE.outer / 2 + 6, y: y + PROFILE.outer / 2 + 6, width: w - (PROFILE.outer + 12), height: h - (PROFILE.outer + 12), stroke: COLORS.frameLight, strokeWidth: 1, opacity: 0.6, listening: false }));
}

function addMemberRect(layer: Konva.Layer | Konva.Group, x: number, y: number, w: number, h: number) {
  layer.add(new Konva.Rect({ x, y, width: w, height: h, fill: "#FFFFFF", stroke: COLORS.frameDark, strokeWidth: 2, listening: false }));
  layer.add(new Konva.Rect({ x: x + 2, y: y + 2, width: w - 4, height: h - 4, stroke: COLORS.frameMid, strokeWidth: 1, opacity: 0.7, listening: false }));
}

function addTag(layer: Konva.Layer | Konva.Group, x: number, y: number, text: string) {
  const padX = 6;
  const padY = 4;

  const t = new Konva.Text({ x, y, text, fontSize: 12, fontStyle: "bold", fill: COLORS.text, listening: false });
  const w = t.width() + padX * 2;
  const h = t.height() + padY * 2;

  layer.add(new Konva.Rect({ x: x - padX, y: y - padY, width: w, height: h, fill: COLORS.labelFill, stroke: COLORS.labelStroke, strokeWidth: 1, listening: false }));
  layer.add(t);
}

function addHandleIcon(layer: Konva.Layer | Konva.Group, x: number, y: number, side: "left" | "right" | "top" | "bottom") {
  const g = new Konva.Group({ x, y, listening: false, opacity: 0.95 });

  g.add(new Konva.Rect({ x: 0, y: 0, width: 12, height: 22, cornerRadius: 3, fill: "#FFFFFF", stroke: COLORS.handleStroke, strokeWidth: 1.5 }));
  g.add(new Konva.Rect({ x: 4, y: 6, width: 14, height: 4, cornerRadius: 2, fill: COLORS.handleStroke, opacity: 0.85 }));
  g.add(new Konva.Circle({ x: 6, y: 16, radius: 2, fill: COLORS.handleStroke, opacity: 0.7 }));

  if (side === "right") g.rotation(0);
  else if (side === "left") { g.rotation(180); g.offsetX(6); g.offsetY(11); }
  else if (side === "top") { g.rotation(-90); g.offsetX(6); g.offsetY(11); }
  else if (side === "bottom") { g.rotation(90); g.offsetX(6); g.offsetY(11); }

  layer.add(g);
}

function addDimensionLine(layer: Konva.Layer | Konva.Group, x1: number, y1: number, x2: number, y2: number, label: string) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  layer.add(new Konva.Arrow({
    points: [x1, y1, x2, y2],
    stroke: "#6B7280",
    fill: "#6B7280",
    strokeWidth: 1.5,
    pointerLength: 6,
    pointerWidth: 6,
    listening: false,
  }));

  layer.add(new Konva.Rect({
    x: midX - 44,
    y: midY - 14,
    width: 88,
    height: 28,
    fill: "#FFFFFF",
    stroke: "#CBD5E1",
    strokeWidth: 1,
    cornerRadius: 2,
    listening: false,
  }));

  layer.add(new Konva.Text({
    x: midX - 44,
    y: midY - 10,
    width: 88,
    align: "center",
    text: label,
    fontSize: 16,
    fill: "#111827",
    listening: false,
  }));
}

/** ===== divider resizing logic =====
 * Adjust only panels around divider:
 * - vertical split: divider between child[i] and child[i+1]
 * - horizontal split: same, but on Y/H
 */
function resizeChildrenByDivider(parent: SectionNode, direction: "vertical" | "horizontal", dividerIndex: number, newBoundary: number, minFrac: number) {
  if (!parent.children || parent.children.length < 2) return;

  const kids = parent.children;
  const a = kids[dividerIndex];
  const b = kids[dividerIndex + 1];
  if (!a || !b) return;

  if (direction === "vertical") {
    const leftEdge = a.x; // within 0..1
    const rightEdge = b.x + b.w;

    const minBoundary = leftEdge + minFrac;
    const maxBoundary = rightEdge - minFrac;

    const boundary = clamp(newBoundary, minBoundary, maxBoundary);

    const newW_A = boundary - leftEdge;
    const newX_B = boundary;
    const newW_B = rightEdge - boundary;

    a.w = newW_A;
    b.x = newX_B;
    b.w = newW_B;

    // also reflow later siblings positions to keep contiguous (safety)
    for (let i = 1; i < kids.length; i++) {
      kids[i].x = kids[i - 1].x + kids[i - 1].w;
    }
  } else {
    const topEdge = a.y;
    const bottomEdge = b.y + b.h;

    const minBoundary = topEdge + minFrac;
    const maxBoundary = bottomEdge - minFrac;

    const boundary = clamp(newBoundary, minBoundary, maxBoundary);

    const newH_A = boundary - topEdge;
    const newY_B = boundary;
    const newH_B = bottomEdge - boundary;

    a.h = newH_A;
    b.y = newY_B;
    b.h = newH_B;

    for (let i = 1; i < kids.length; i++) {
      kids[i].y = kids[i - 1].y + kids[i - 1].h;
    }
  }
}

export default function WindowDoorConfigurator({
  onAddItem,
  onClose,
}: {
  onAddItem: (payload: AddItemPayload) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imageTick, setImageTick] = useState(0);

  const [selectedId, setSelectedId] = useState("root");
  const [widthMm, setWidthMm] = useState(1500);
  const [heightMm, setHeightMm] = useState(1500);

  const [meta] = useState<ProductMeta>(DEFAULT_META);
  const [baseSystemType, setBaseSystemType] = useState<SystemType>("Casement");
  const [showSetup] = useState(false);

  const [splitCount, setSplitCount] = useState(2);
  const [splitDirection, setSplitDirection] = useState<SplitDirection>("vertical");
  const [baseGlass, setBaseGlass] = useState<"Yes" | "No">("Yes");
  const [baseMesh, setBaseMesh] = useState<"Yes" | "No">("No");

  const [stageSize, setStageSize] = useState({ w: 720, h: 520 });

  const { past, future, present, push, setDirect, undo, redo, reset } = useHistory(
    buildPreset(DEFAULT_META.systemType as SystemType, "Yes", "No")
  );

  const root = present;
  const selectedNode = findNode(root, selectedId) ?? root;
  const systemsQuery = useSystemsQuery();
  const seriesQuery = useSeriesQuery(selectedNode.systemType);
  const descriptionsQuery = useDescriptionsQuery(selectedNode.systemType, selectedNode.series);
  const systemOptions = systemsQuery.data?.systems ?? ["Casement", "Sliding", "Slide N Fold"];
  const seriesOptions = seriesQuery.data?.series ?? [];
  const descriptionOptions = descriptionsQuery.data?.descriptions ?? [];

  const rootDimensions = useMemo(() => {
    const baseW = Math.max(widthMm, 400);
    const baseH = Math.max(heightMm, 400);
    return { w: baseW, h: baseH };
  }, [widthMm, heightMm]);

  const view = useMemo(() => {
    const padding = 56;
    const maxW = stageSize.w - padding * 2;
    const maxH = stageSize.h - padding * 2;
    const ratio = Math.min(maxW / rootDimensions.w, maxH / rootDimensions.h);
    const drawW = rootDimensions.w * ratio;
    const drawH = rootDimensions.h * ratio;
    const offsetX = (stageSize.w - drawW) / 2;
    const offsetY = (stageSize.h - drawH) / 2;
    return { ratio, drawW, drawH, offsetX, offsetY };
  }, [rootDimensions, stageSize]);

  const clampMm = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(value)));

  const applyChildSizes = useCallback((
    parent: SectionNode,
    sizesMm: number[],
    direction: SplitDirection,
    totalMm: number
  ) => {
    if (!parent.children || parent.children.length !== sizesMm.length) return;
    let cursor = 0;
    parent.children.forEach((child, idx) => {
      if (direction === "vertical") {
        child.x = parent.x + cursor / widthMm;
        child.w = sizesMm[idx] / widthMm;
        child.y = parent.y;
        child.h = parent.h;
        cursor += sizesMm[idx];
      } else {
        child.y = parent.y + cursor / heightMm;
        child.h = sizesMm[idx] / heightMm;
        child.x = parent.x;
        child.w = parent.w;
        cursor += sizesMm[idx];
      }
    });
  }, [heightMm, widthMm]);

  const updateChildDimension = useCallback((
    parentId: string,
    index: number,
    newMmRaw: number,
    direction: SplitDirection
  ) => {
    const next = cloneTree(root);
    const parent = findNode(next, parentId);
    if (!parent || !parent.children || parent.children.length < 2) return;
    const total = direction === "vertical" ? parent.w * widthMm : parent.h * heightMm;
    const minMm = 0;
    const count = parent.children.length;

    const current = parent.children.map((c) =>
      Math.round(direction === "vertical" ? c.w * widthMm : c.h * heightMm)
    );
    const maxForIndex = total - minMm * (count - 1);
    const newMm = clampMm(newMmRaw, minMm, maxForIndex);

    const remaining = total - newMm;
    const restSum = current.reduce((acc, val, i) => (i === index ? acc : acc + val), 0);
    const scaled: number[] = current.map((val, i) => {
      if (i === index) return newMm;
      if (restSum <= 0) return minMm;
      return Math.max(minMm, Math.round((val / restSum) * remaining));
    });

    const sum = scaled.reduce((acc, val) => acc + val, 0);
    const diff = total - sum;
    if (diff !== 0) {
      const adjustIndex = scaled.findIndex((_, i) => i !== index);
      if (adjustIndex >= 0) scaled[adjustIndex] = Math.max(minMm, scaled[adjustIndex] + diff);
      else scaled[index] = Math.max(minMm, scaled[index] + diff);
    }

    applyChildSizes(parent, scaled, direction, total);
    push(next);
  }, [applyChildSizes, heightMm, push, root, widthMm]);

  const updateLeafPanelDimension = useCallback((
    leafId: string,
    index: number,
    newMmRaw: number
  ) => {
    const next = cloneTree(root);
    const leaf = findNode(next, leafId);
    if (!leaf || !leaf.panelFractions || leaf.panelFractions.length < 2) return;

    const total = leaf.w * widthMm;
    const minMm = 120;
    const count = leaf.panelFractions.length;

    const current = leaf.panelFractions.map((frac) => Math.round(frac * total));
    const maxForIndex = total - minMm * (count - 1);
    const newMm = clampMm(newMmRaw, minMm, maxForIndex);

    const remaining = total - newMm;
    const restSum = current.reduce((acc, val, i) => (i === index ? acc : acc + val), 0);
    const scaled: number[] = current.map((val, i) => {
      if (i === index) return newMm;
      if (restSum <= 0) return minMm;
      return Math.max(minMm, Math.round((val / restSum) * remaining));
    });

    const sum = scaled.reduce((acc, val) => acc + val, 0);
    const diff = total - sum;
    if (diff !== 0) {
      const adjustIndex = scaled.findIndex((_, i) => i !== index);
      if (adjustIndex >= 0) scaled[adjustIndex] = Math.max(minMm, scaled[adjustIndex] + diff);
      else scaled[index] = Math.max(minMm, scaled[index] + diff);
    }

    leaf.panelFractions = scaled.map((val) => (total > 0 ? val / total : 0));
    push(next);
  }, [clampMm, push, root, widthMm]);

  const dimensionLabels = useMemo(() => {
    const labels: Array<{
      id: string;
      x: number;
      y: number;
      value: number;
      onChange: (next: number) => void;
    }> = [];

    const fx = view.offsetX;
    const fy = view.offsetY;
    const fw = view.drawW;
    const fh = view.drawH;
    const boxW = 88;
    const boxH = 28;
    const clampX = (x: number) => Math.max(0, Math.min(x, stageSize.w - boxW));
    const clampY = (y: number) => Math.max(0, Math.min(y, stageSize.h - boxH));

    // main height label
    const hMidX = (fx - 44 + (fx - 44)) / 2;
    const hMidY = (fy + fy + fh) / 2;
    labels.push({
      id: "height",
      x: clampX(hMidX - 44),
      y: clampY(hMidY - 14),
      value: heightMm,
      onChange: (next) => setHeightMm(clampMm(next, 400, 100000)),
    });

    // main width label
    const wMidX = (fx + fx + fw) / 2;
    const wMidY = (fy + fh + 44 + (fy + fh + 44)) / 2;
    labels.push({
      id: "width",
      x: clampX(wMidX - 44),
      y: clampY(wMidY - 14),
      value: widthMm,
      onChange: (next) => setWidthMm(clampMm(next, 400, 100000)),
    });

    const splitParents: SectionNode[] = [];
    const collectSplits = (node: SectionNode) => {
      if (node.children && node.children.length >= 2 && node.split !== "none") {
        splitParents.push(node);
      }
      node.children?.forEach(collectSplits);
    };
    collectSplits(root);

    splitParents.forEach((parent) => {
      const px = fx + parent.x * fw;
      const py = fy + parent.y * fh;
      const pw = parent.w * fw;
      const ph = parent.h * fh;

      if (parent.split === "vertical") {
        const y2 = py + ph + 18;
        parent.children!.forEach((c, idx) => {
          const midX = (fx + c.x * fw + fx + (c.x + c.w) * fw) / 2;
          labels.push({
            id: `sub-w-${parent.id}-${idx}`,
            x: clampX(midX - 44),
            y: clampY(y2 - 14),
            value: Math.round(c.w * widthMm),
            onChange: (next) => updateChildDimension(parent.id, idx, next, "vertical"),
          });
        });
      }

      if (parent.split === "horizontal") {
        const x2 = px - 18;
        parent.children!.forEach((c, idx) => {
          const midY = (fy + c.y * fh + fy + (c.y + c.h) * fh) / 2;
          labels.push({
            id: `sub-h-${parent.id}-${idx}`,
            x: clampX(x2 - 44),
            y: clampY(midY - 14),
            value: Math.round(c.h * heightMm),
            onChange: (next) => updateChildDimension(parent.id, idx, next, "horizontal"),
          });
        });
      }
    });

    // leaf panel labels for descriptions (track/panel)
    const leaves: SectionNode[] = [];
    mapLeafNodes(root, (leaf) => leaves.push(leaf));
    leaves.forEach((leaf) => {
      if (!leaf.panelFractions || leaf.panelFractions.length < 2) return;
      const leafX = fx + leaf.x * fw;
      const leafY = fy + leaf.y * fh;
      const leafW = leaf.w * fw;
      const leafH = leaf.h * fh;
      const y2 = leafY + leafH + 10;
      let cursor = leafX;
      leaf.panelFractions.forEach((frac, idx) => {
        const pw = leafW * frac;
        const midX = cursor + pw / 2;
        labels.push({
          id: `leaf-${leaf.id}-${idx}`,
          x: clampX(midX - 44),
          y: clampY(y2 - 14),
          value: Math.round(frac * leaf.w * widthMm),
          onChange: (next) => updateLeafPanelDimension(leaf.id, idx, next),
        });
        cursor += pw;
      });
    });

    return labels;
  }, [heightMm, widthMm, root, view, updateChildDimension, stageSize, updateLeafPanelDimension]);

  const getCachedImage = useCallback((path: string) => {
    if (!path) return undefined;
    const cached = imageCacheRef.current.get(path);
    if (cached) return cached;
    const img = new Image();
    img.src = path;
    img.onload = () => setImageTick((v) => v + 1);
    imageCacheRef.current.set(path, img);
    return img;
  }, []);


  const handleAddItem = () => {
    const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? "";
    const areaSqft = mmToSqft(widthMm, heightMm);

    const leafNodes: SectionNode[] = [];
    mapLeafNodes(root, (leaf) => leafNodes.push(leaf));

    const subItems = leafNodes.map((leaf) => ({
      widthMm: Math.round(leaf.w * widthMm),
      heightMm: Math.round(leaf.h * heightMm),
      areaSqft: mmToSqft(leaf.w * widthMm, leaf.h * heightMm),
      systemType: leaf.systemType,
      series: leaf.series,
      description: leaf.description,
      glass: leaf.glass,
      mesh: leaf.mesh,
    }));

    const singleLeaf = leafNodes[0];
    const anyMesh = subItems.some((item) => item.mesh === "Yes");
    const anyGlass = subItems.some((item) => item.glass === "Yes");

    onAddItem({
      widthMm,
      heightMm,
      areaSqft,
      refImage: dataUrl,
      meta: {
        ...meta,
        systemType: subItems.length > 1 ? "Combination" : singleLeaf.systemType,
        series: subItems.length > 1 ? meta.series : singleLeaf.series,
        description:
          subItems.length > 1
            ? meta.description || `${meta.systemType} ${meta.productType}`
            : singleLeaf.description || `${singleLeaf.systemType} ${meta.productType}`,
        glassSpec: meta.glassSpec || (anyGlass ? "Yes" : "No"),
        meshPresent: anyMesh ? "Yes" : "No",
      },
      subItems: subItems.length > 1 ? subItems : undefined,
    });
  };

  const splitSelected = useCallback(
    (direction: SplitDirection) => {
      if (!selectedNode || selectedNode.children?.length) return;

      const next = cloneTree(root);
      const target = findNode(next, selectedId);
      if (!target) return;

      target.split = direction;
      target.children = buildSplitChildren(target, direction, baseSystemType, baseGlass, baseMesh, splitCount);

      // sliding default alt left/right
      if (baseSystemType === "Sliding" && target.children) {
        target.children.forEach((c, idx) => {
          c.systemType = "Sliding";
          c.sash = idx % 2 === 0 ? "left" : "right";
        });
      }

      push(next);
    },
    [root, selectedId, selectedNode, baseSystemType, baseGlass, baseMesh, push, splitCount]
  );

  const mergeSelected = useCallback(() => {
    const next = cloneTree(root);
    const target = findNode(next, selectedId);
    if (!target) return;

    const mergeNode = target.children?.length ? target : findParent(next, selectedId);
    if (!mergeNode) return;

    mergeNode.split = "none";
    mergeNode.children = undefined;
    push(next);
  }, [push, root, selectedId]);

  /** ===== Canvas interactions ===== */

  const renderCanvas = useCallback(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    layer.destroyChildren();

    // bg
    layer.add(new Konva.Rect({ x: 0, y: 0, width: stageSize.w, height: stageSize.h, fill: COLORS.bg }));

    // grid
    const gridSize = 20;
    for (let x = 0; x <= stageSize.w; x += gridSize) {
      layer.add(new Konva.Line({ points: [x, 0, x, stageSize.h], stroke: COLORS.grid, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, listening: false }));
    }
    for (let y = 0; y <= stageSize.h; y += gridSize) {
      layer.add(new Konva.Line({ points: [0, y, stageSize.w, y], stroke: COLORS.grid, strokeWidth: y % (gridSize * 5) === 0 ? 1.2 : 0.6, listening: false }));
    }

    const fx = view.offsetX;
    const fy = view.offsetY;
    const fw = view.drawW;
    const fh = view.drawH;

    addProfileRect(layer, fx, fy, fw, fh, selectedId === "root");

    // root hit
    const rootHit = new Konva.Rect({ x: fx, y: fy, width: fw, height: fh, fill: "transparent" });
    rootHit.on("click tap", () => setSelectedId("root"));
    layer.add(rootHit);

    /** ============ OUTER RESIZE HANDLES REMOVED ============ */

    /** ============ DRAW MEMBERS & DRAGGABLE DIVIDERS ============ */

    // draw member rectangles for any parent that has children
    // and create draggable dividers between consecutive children
    const drawParentDividers = (parent: SectionNode) => {
      if (!parent.children || parent.children.length < 2) return;

      const dir = parent.split;
      if (dir !== "vertical" && dir !== "horizontal") return;

      // Minimum panel size (in fraction of parent)
      // 120mm minimum -> convert to frac based on total mm
      const minPx = 70; // visual min
      const minFrac = (minPx / (dir === "vertical" ? fw : fh)) * parent[dir === "vertical" ? "w" : "h"];

      for (let i = 0; i < parent.children.length - 1; i++) {
        const a = parent.children[i];
        // divider boundary in normalized space:
        const boundary = dir === "vertical" ? a.x + a.w : a.y + a.h;

        if (dir === "vertical") {
          const x = fx + boundary * fw;
          const mx = x - PROFILE.mullion / 2;
          addMemberRect(layer, mx, fy + PROFILE.outer, PROFILE.mullion, fh - PROFILE.outer * 2);

          // mullion is fixed (no drag)
        } else {
          const y = fy + boundary * fh;
          const my = y - PROFILE.mullion / 2;
          addMemberRect(layer, fx + PROFILE.outer, my, fw - PROFILE.outer * 2, PROFILE.mullion);
          // mullion is fixed (no drag)
        }
      }

      // recurse nested
      parent.children.forEach(drawParentDividers);
    };

    drawParentDividers(root);

    /** ============ DRAW LEAVES ============ */
    const leaves: SectionNode[] = [];
    mapLeafNodes(root, (leaf) => leaves.push(leaf));
    leaves.sort((a, b) => (a.y - b.y) || (a.x - b.x));

    leaves.forEach((leaf, idx) => {
      const x = fx + leaf.x * fw;
      const y = fy + leaf.y * fh;
      const w = leaf.w * fw;
      const h = leaf.h * fh;
      const isSelected = leaf.id === selectedId;

      const g = new Konva.Group({ listening: true, draggable: false });
      g.on("click tap", () => setSelectedId(leaf.id));

      // hit area for reliable selection
      g.add(new Konva.Rect({
        x,
        y,
        width: w,
        height: h,
        fill: "rgba(255,255,255,0.01)",
        listening: true,
      }));

      // sash profile
      g.add(new Konva.Rect({
        x: x + PROFILE.outer / 2 + PROFILE.gap,
        y: y + PROFILE.outer / 2 + PROFILE.gap,
        width: w - (PROFILE.outer + PROFILE.gap * 2),
        height: h - (PROFILE.outer + PROFILE.gap * 2),
        stroke: isSelected ? COLORS.selected : COLORS.frameDark,
        strokeWidth: PROFILE.sash,
        listening: false,
      }));

      const inset = PROFILE.outer / 2 + PROFILE.sash + 6;

      const handledByDescription = (() => {
        const desc = leaf.description;
        if (!desc) return false;

        const innerX = x + inset;
        const innerY = y + inset;
        const innerW = w - inset * 2;
        const innerH = h - inset * 2;

        if (leaf.systemType === "Casement") {
          const imagePath = getImagePath(desc);
          const img = getCachedImage(imagePath);
          if (img && img.complete && img.naturalWidth > 0) {
            g.add(new Konva.Image({
              image: img,
              x: innerX,
              y: innerY,
              width: innerW,
              height: innerH,
              opacity: 0.9,
              listening: false,
            }));
            return true;
          }
        }

        const fixedPanel = (px: number, py: number, pw: number, ph: number) => {
          g.add(new Konva.Rect({
            x: px,
            y: py,
            width: pw,
            height: ph,
            fill: leaf.glass === "Yes" ? COLORS.glass : "#FFFFFF",
            stroke: COLORS.glassStroke,
            strokeWidth: 1,
            opacity: leaf.glass === "Yes" ? 1 : 0.6,
            listening: false,
          }));
        };

        const drawPanels = (fractions: number[], sashTypes?: SashType[], meshCount = 0) => {
          let cursor = innerX;
          fractions.forEach((frac, idx) => {
            const pw = innerW * frac;
            fixedPanel(cursor, innerY, pw, innerH);
            if (sashTypes?.[idx]) {
              drawSashGlyph(g, cursor, innerY, pw, innerH, sashTypes[idx], COLORS.frameDark);
            }
            if (meshCount > 0 && idx >= fractions.length - meshCount) {
              const step = Math.max(8, Math.min(pw, innerH) / 14);
              for (let i = cursor + step; i < cursor + pw; i += step) {
                g.add(new Konva.Line({ points: [i, innerY, i, innerY + innerH], stroke: COLORS.frameDark, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, opacity: 0.85, listening: false }));
              }
              for (let j = innerY + step; j < innerY + innerH; j += step) {
                g.add(new Konva.Line({ points: [cursor, j, cursor + pw, j], stroke: COLORS.frameDark, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, opacity: 0.85, listening: false }));
              }
            }
            cursor += pw;
          });
        };

        if (desc === "Fix") {
          fixedPanel(innerX, innerY, innerW, innerH);
          return true;
        }

        if (desc === "Left Openable" || desc === "Left Openable Door-Window") {
          fixedPanel(innerX, innerY, innerW, innerH);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "left", COLORS.frameDark);
          return true;
        }

        if (desc === "Right Openable" || desc === "Right Openable Door-Window") {
          fixedPanel(innerX, innerY, innerW, innerH);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "right", COLORS.frameDark);
          return true;
        }

        if (desc === "Top Hung Window") {
          fixedPanel(innerX, innerY, innerW, innerH);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "top", COLORS.frameDark);
          return true;
        }

        if (desc === "Bottom Hung Window") {
          fixedPanel(innerX, innerY, innerW, innerH);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "bottom", COLORS.frameDark);
          return true;
        }

        if (desc === "Parallel Window") {
          fixedPanel(innerX, innerY, innerW, innerH);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "double", COLORS.frameDark);
          return true;
        }

        if (desc === "Tilt and Turn Window") {
          fixedPanel(innerX, innerY, innerW, innerH);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "left", COLORS.frameDark);
          drawSashGlyph(g, innerX, innerY, innerW, innerH, "top", COLORS.frameDark);
          return true;
        }

        if (desc === "French Door-Window") {
          drawPanels([0.5, 0.5], ["left", "right"]);
          return true;
        }

        if (desc === "Left Openable + Fixed") {
          drawPanels([0.5, 0.5], ["left", "fixed"]);
          return true;
        }

        if (desc === "Right Openable + Fixed") {
          drawPanels([0.5, 0.5], ["fixed", "right"]);
          return true;
        }

        if (desc === "Left Openable + Fixed + Right Openable") {
          drawPanels([0.33, 0.34, 0.33], ["left", "fixed", "right"]);
          return true;
        }

        const pattern = parsePanelPattern(desc);
        if (pattern) {
          const fractions = leaf.panelFractions && leaf.panelFractions.length === pattern.fractions.length
            ? leaf.panelFractions
            : pattern.fractions;
          drawPanels(fractions, undefined, leaf.panelMeshCount ?? pattern.meshCount ?? 0);
          return true;
        }

        return false;
      })();

      if (!handledByDescription) {
        g.add(new Konva.Rect({
          x: x + inset,
          y: y + inset,
          width: w - inset * 2,
          height: h - inset * 2,
          fill: leaf.glass === "Yes" ? COLORS.glass : "#FFFFFF",
          stroke: COLORS.glassStroke,
          strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6,
          opacity: leaf.glass === "Yes" ? 1 : 0.6,
          listening: false,
        }));
      }

      // mesh
      if (leaf.mesh === "Yes") {
        const meshX = x + inset + 2;
        const meshY = y + inset + 2;
        const meshW = w - (inset + 2) * 2;
        const meshH = h - (inset + 2) * 2;
        const step = Math.max(8, Math.min(meshW, meshH) / 14);

        for (let i = meshX + step; i < meshX + meshW; i += step) {
          g.add(new Konva.Line({ points: [i, meshY, i, meshY + meshH], stroke: COLORS.mesh, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, opacity: 0.95, listening: false }));
        }
        for (let j = meshY + step; j < meshY + meshH; j += step) {
          g.add(new Konva.Line({ points: [meshX, j, meshX + meshW, j], stroke: COLORS.mesh, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, opacity: 0.95, listening: false }));
        }
      }

      // handle icon for openable/sliding-movable
      const insetHandle = inset + 6;
      const isSliding = leaf.systemType === "Sliding";
      const isSlideFold = leaf.systemType === "Slide N Fold";
      const isOpenable = !isSliding && !isSlideFold && leaf.sash !== "fixed";
      const isSlidingMove = isSliding && (leaf.sash === "left" || leaf.sash === "right");

      if (isOpenable) {
        if (leaf.sash === "left") addHandleIcon(g, x + w - insetHandle - 18, y + h / 2 - 18, "right");
        else if (leaf.sash === "right") addHandleIcon(g, x + insetHandle, y + h / 2 - 18, "left");
        else if (leaf.sash === "top") addHandleIcon(g, x + w / 2 - 6, y + h - insetHandle - 26, "bottom");
        else if (leaf.sash === "bottom") addHandleIcon(g, x + w / 2 - 6, y + insetHandle, "top");
        else if (leaf.sash === "double") addHandleIcon(g, x + w / 2 - 6, y + h / 2 - 18, "right");
      }

      if (isSlidingMove) {
        if (leaf.sash === "left") addHandleIcon(g, x + w * 0.55, y + h / 2 - 18, "right");
        if (leaf.sash === "right") addHandleIcon(g, x + w * 0.40, y + h / 2 - 18, "left");

        // darker arrow moved away from bottom rail
        const arrowY = y + h - 34;
        const from = leaf.sash === "left" ? x + w * 0.72 : x + w * 0.28;
        const to = leaf.sash === "left" ? x + w * 0.28 : x + w * 0.72;

        g.add(new Konva.Arrow({
          points: [from, arrowY, to, arrowY],
          stroke: "#111827",
          fill: "#111827",
          strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6,
          pointerLength: 8,
          pointerWidth: 8,
          opacity: 0.7,
          listening: false,
        }));
      }

      if (isSliding) {
        const railY = y + h - (PROFILE.outer / 2 + 6);
        g.add(new Konva.Line({
          points: [x + inset, railY, x + w - inset, railY],
          stroke: "#475569",
          strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6,
          opacity: 0.8,
          listening: false,
        }));
      }

      if (isSlideFold) {
        const foldX = x + w * 0.72;
        g.add(new Konva.Line({
          points: [foldX, y + inset, foldX, y + h - inset],
          stroke: "#334155",
          strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6,
          dash: [4, 3],
          opacity: 0.8,
          listening: false,
        }));
        g.add(new Konva.Arrow({
          points: [foldX - 18, y + h * 0.2, foldX + 18, y + h * 0.2],
          stroke: "#111827",
          fill: "#111827",
          strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6,
          pointerLength: 6,
          pointerWidth: 6,
          opacity: 0.65,
          listening: false,
        }));
      }

      // leaf label (system + size)
      g.add(new Konva.Text({
        text: `${leaf.systemType}${leaf.series ? ` · ${leaf.series}` : ""}${leaf.description ? ` · ${leaf.description}` : ""}`,
        x: x + 8,
        y: y + 8,
        fontSize: 12,
        fill: COLORS.text,
        listening: false,
      }));

      // leaf index circle + crosshair (like ref)
      g.add(new Konva.Circle({ x: x + w / 2, y: y + h / 2 - 10, radius: 14, fill: "#FFFFFF", stroke: COLORS.frameDark, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, listening: false }));
      g.add(new Konva.Text({ x: x + w / 2 - 14, y: y + h / 2 - 18, width: 28, align: "center", text: String(idx + 1), fontSize: 12, fontStyle: "bold", fill: COLORS.text, listening: false }));
      g.add(new Konva.Line({ points: [x + w / 2 - 10, y + h / 2 + 8, x + w / 2 + 10, y + h / 2 + 8], stroke: COLORS.frameDark, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, opacity: 0.85, listening: false }));
      g.add(new Konva.Line({ points: [x + w / 2, y + h / 2 - 2, x + w / 2, y + h / 2 + 18], stroke: COLORS.frameDark, strokeWidth: x % (gridSize * 5) === 0 ? 1.2 : 0.6, opacity: 0.85, listening: false }));

      layer.add(g);
    });

    /** ============ DIMENSIONS (lines only; inputs are HTML overlays) ============ */
    addDimensionLine(layer, fx - 44, fy, fx - 44, fy + fh, "");
    addDimensionLine(layer, fx, fy + fh + 44, fx + fw, fy + fh + 44, "");

    if (root.split === "vertical" && (root.children?.length ?? 0) >= 2) {
      const y2 = fy + fh + 18;
      root.children!.forEach((c) => {
        addDimensionLine(layer, fx + c.x * fw, y2, fx + (c.x + c.w) * fw, y2, "");
      });
    }

    if (root.split === "horizontal" && (root.children?.length ?? 0) >= 2) {
      const x2 = fx - 18;
      root.children!.forEach((c) => {
        addDimensionLine(layer, x2, fy + c.y * fh, x2, fy + (c.y + c.h) * fh, "");
      });
    }

    // tag F1 bottom-right leaf
    const leaves2: SectionNode[] = [];
    mapLeafNodes(root, (leaf) => leaves2.push(leaf));
    const rightMost = [...leaves2].sort((a, b) => (b.x + b.w) - (a.x + a.w) || (b.y + b.h) - (a.y + a.h))[0];
    if (rightMost) {
      const rx = fx + rightMost.x * fw;
      const ry = fy + rightMost.y * fh;
      const rw = rightMost.w * fw;
      const rh = rightMost.h * fh;
      addTag(layer, rx + rw - 54, ry + rh - 54, "F1");
    }

    layer.draw();
  }, [heightMm, push, root, selectedId, setDirect, stageSize.h, stageSize.w, view, widthMm, getCachedImage, imageTick]);

  // create stage
  useEffect(() => {
    if (!containerRef.current) return;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width: stageSize.w,
      height: stageSize.h,
    });
    const layer = new Konva.Layer();
    stage.add(layer);

    stageRef.current = stage;
    layerRef.current = layer;

    renderCanvas();

    return () => {
      stage.destroy();
      stageRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resize responsive
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(420, Math.floor(rect.width));
      const h = Math.max(440, Math.floor(Math.min(680, rect.width * 0.78)));

      setStageSize({ w, h });
      if (stageRef.current) {
        stageRef.current.width(w);
        stageRef.current.height(h);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // rerender
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // apply base preset
  useEffect(() => {
    reset(buildPreset(baseSystemType, baseGlass, baseMesh));
    setSelectedId("root");
  }, [baseGlass, baseMesh, baseSystemType, reset]);

  const areaSqft = useMemo(() => mmToSqft(widthMm, heightMm), [widthMm, heightMm]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">

      {/* LEFT */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              type="button"
              onClick={undo}
              disabled={past.length === 0}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={future.length === 0}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => reset(buildPreset(baseSystemType, baseGlass, baseMesh))}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        <div className="text-xs text-gray-400">
          Use the dimension boxes to edit sizes
        </div>
      </div>

      <div ref={canvasWrapRef} className="relative w-full min-w-0">
        <div
          ref={containerRef}
          className="rounded-xl border border-gray-200 bg-[#F9FBFD] w-full overflow-hidden"
          style={{ width: "100%", height: stageSize.h }}
        />
        <div className="pointer-events-none absolute inset-0">
          {dimensionLabels.map((label) => (
            <input
              key={label.id}
              type="number"
              value={label.value}
              onChange={(e) => label.onChange(Number(e.target.value))}
              className="pointer-events-auto absolute h-7 w-[88px] rounded-sm border border-[#CBD5E1] bg-white text-center text-sm text-gray-900 shadow-sm focus:border-[#124657] focus:outline-none focus:ring-2 focus:ring-[#124657]"
              style={{ left: label.x, top: label.y }}
            />
          ))}
        </div>
      </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            Split Count
            <select
              value={splitCount}
              onChange={(e) => setSplitCount(Number(e.target.value) || 2)}
              className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-[#124657] focus:ring-2 focus:ring-[#124657]"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            Direction
            <select
              value={splitDirection}
              onChange={(e) => setSplitDirection(e.target.value as SplitDirection)}
              className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-[#124657] focus:ring-2 focus:ring-[#124657]"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => splitSelected(splitDirection)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {splitDirection === "vertical" ? (
              <SplitSquareVertical className="h-4 w-4" />
            ) : (
              <SplitSquareHorizontal className="h-4 w-4" />
            )}
            Split
          </button>

          <button
            type="button"
            onClick={mergeSelected}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Square className="h-4 w-4" />
            Merge Section
          </button>
        </div>
      </div>

      {/* RIGHT (READ ONLY) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Summary</h4>

        <div className="mb-5 rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Selected Section
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <label className="text-xs text-gray-600">
              System
              <select
                value={selectedNode.systemType}
                onChange={(e) => {
                  const next = cloneTree(root);
                  const target = findNode(next, selectedId);
                  if (!target) return;
                  target.systemType = e.target.value as SystemType;
                  target.series = "";
                  target.description = "";
                  push(next);
                }}
                className="mt-1 w-full rounded-md border border-gray-200 px-2 py-2 text-sm focus:border-[#124657] focus:ring-2 focus:ring-[#124657]"
              >
                {systemOptions.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-gray-600">
              Series
              <select
                value={selectedNode.series}
                onChange={(e) => {
                  const next = cloneTree(root);
                  const target = findNode(next, selectedId);
                  if (!target) return;
                  target.series = e.target.value;
                  target.description = "";
                  push(next);
                }}
                className="mt-1 w-full rounded-md border border-gray-200 px-2 py-2 text-sm focus:border-[#124657] focus:ring-2 focus:ring-[#124657]"
              >
                <option value="">Select</option>
                {seriesOptions.map((series) => (
                  <option key={series} value={series}>
                    {series}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-gray-600">
              Description
              <select
                value={selectedNode.description}
                onChange={(e) => {
                  const next = cloneTree(root);
                  const target = findNode(next, selectedId);
                  if (!target) return;
                  target.description = e.target.value;
                  const pattern = parsePanelPattern(target.description);
                  if (pattern) {
                    target.panelFractions = pattern.fractions;
                    target.panelMeshCount = pattern.meshCount;
                  } else {
                    target.panelFractions = undefined;
                    target.panelMeshCount = undefined;
                  }
                  push(next);
                }}
                className="mt-1 w-full rounded-md border border-gray-200 px-2 py-2 text-sm focus:border-[#124657] focus:ring-2 focus:ring-[#124657]"
              >
                <option value="">Select</option>
                {descriptionOptions.map((desc: Description) => (
                  <option key={desc.name} value={desc.name}>
                    {desc.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-gray-500">Width</span>
            <span className="font-semibold">{widthMm} mm</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-gray-500">Height</span>
            <span className="font-semibold">{heightMm} mm</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-gray-500">Area</span>
            <span className="font-semibold">{areaSqft} sq ft</span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full rounded-lg bg-[#124657] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b3642]"
            >
              Add to Quotation
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-400">
            Selected: <span className="font-medium text-gray-600">{selectedNode.id === "root" ? "Whole Frame" : "Section"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
