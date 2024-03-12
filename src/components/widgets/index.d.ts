export type WidgetConfig = {
  tileColumnCount: number;
  tileRowCount: number;
}

export type DragData = {
  columnTile: number;
  rowTile: number;
}

export type WidgetDataTransfer = {
  widgetType: string;
  positionIndex: number;
  widgetSettings: WidgetConfig;
  widgetDragData: DragData;
}