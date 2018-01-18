/* global tnt:true */
// import geneLabelFeature from '../features/geneLabelFeature';
import pkg from '../../package.json';

export default function infoTrack(config) {
    const track = tnt.board.track()
        .label(`POSTGAP visualisation v${pkg.version}`)
        .height(20)
        .color('white')
        .display(tnt.board.track.feature().move(() => {}).create(() => {}));
        // No data
    return track;
}
