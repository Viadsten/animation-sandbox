import { BlobScene } from './Blob';
import { CirclesScene } from './Circles';
import { LinesScene } from './Lines';
import BrickWave from './brick-wave';
import CloudGridScene from './cloud-grid';
import imgCarouselScene from './img-carousel';
import { LiquidBox } from './liquidBox';
import TemplateScene from './template';

export const initScenes = () => {
  new BrickWave()
  new TemplateScene()
  new imgCarouselScene()
  new CloudGridScene()
  new LiquidBox()
  new BlobScene()
  new CirclesScene()
  new LinesScene()
}