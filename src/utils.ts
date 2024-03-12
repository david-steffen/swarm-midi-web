export function calcGridColumn(index: number, horizontalGridTileCount: number) {
  return index % horizontalGridTileCount || horizontalGridTileCount

}

export function calcGridRow(index: number, horizontalGridTileCount:number) {
    return Math.ceil(index / horizontalGridTileCount)
}