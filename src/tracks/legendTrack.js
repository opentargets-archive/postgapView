/* global tnt:true */
import legendFeature from '../features/legendFeature';

export default function legendTrack(config) {
    const track = tnt.board.track()
        .height(80)
        .color('white')
        .display(legendFeature);
        // No data
    return track;
}
