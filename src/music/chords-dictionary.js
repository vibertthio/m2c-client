const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const properties = ['M', 'm', 'M#5', 'o'];
const chordsDictionary = (new Array(49).fill('')).map((x, i) => {
  if (i === 48) {
    return 'REST';
  }
  let c = notes[Math.floor(i / 4)];
  c += properties[i % 4];
  return c;
});

export default chordsDictionary;

