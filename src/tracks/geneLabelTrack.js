/* global tnt:true */
// import geneLabelFeature from '../features/geneLabelFeature';

export default function geneLabelTrack(config) {
    const track = tnt.board.track()
        .label('Target')
        .height(20)
        .color('white')
        .display(tnt.board.track.feature().move(() => {}).create(() => {}));
        // No data
    return track;
}
