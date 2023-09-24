import BrickWave from './brick-wave';
import CloudGridScene from './cloud-grid';
import imgCarouselScene from './img-carousel';
import TemplateScene from './template';

export const initScenes = () => {
  new BrickWave()
  new TemplateScene()
  new imgCarouselScene()
  new CloudGridScene()
}