// Year 7 Chapter 10: Analysing data. One lesson per exercise (10.01 to 10.08).
module.exports = {
  year: 7,
  stage: 4,
  number: 10,
  title: 'Analysing data',
  fileName: 'Year7-Ch10-Analysing-Data',
  goals: [
    'interpret a variety of statistical graphs, including divided bar graphs, sector graphs and line graphs',
    'identify graphs that are misleading',
    'draw stem-and-leaf plots and dot plots',
    'calculate the mean, mode, median and range of a set of data, including data shown on graphs and plots',
    'compare data sets using statistics, including identifying outliers',
    'use primary and secondary data',
  ],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Statistics: MA4-DAT-C-01 classifies and displays data using a variety of graphical representations; MA4-DAT-C-02 analyses simple datasets using measures of centre, range and shape of the data.',
  lessons: ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08'].map((f) => require(`./lessons/${f}`)),
};
