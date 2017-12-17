/* global tnt:true */

// sequence track
export default function sequenceTrack() {
    return tnt.board.track()
        .height(30)
        .color('white')
        .display(tnt.board.track.feature.genome.sequence())
        .data(tnt.board.track.data.genome.sequence()
            .limit(150),
        );
}
