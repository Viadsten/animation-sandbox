import CircleGridScene from './circle-grid';
import { BlobScene } from './Blob';
import { CirclesScene } from './Circles';
import { LinesScene } from './Lines';
import BrickWave from './brick-wave';
import {BrickPreloader} from './BrickPreloader';
import CloudGridScene from './cloud-grid';
import imgCarouselScene from './img-carousel';
import { LiquidBox } from './liquidBox';
import TemplateScene from './template';
import DragGrid from './DragGrid';

export const initScenes = () => {
  new BrickWave()
  new TemplateScene()
  new imgCarouselScene()
  new CloudGridScene()
  new LiquidBox()
  new BlobScene()
  new CirclesScene()
  new LinesScene()
  new CircleGridScene()
  new BrickPreloader()
  new DragGrid()
}