import heartpy as hp

#fname = "log_withGarminOptical_BTHRM.csv"
fname = "HRM_data_walking.csv"

hrdata = hp.get_data(fname, column_name='raw')
#timerdata = hp.get_data(fname, column_name='datetime')

print(hrdata)

#working_data, measures = hp.process(hrdata, hp.get_samplerate_mstimer(timerdata))
working_data, measures = hp.process(hrdata, 25.0)  #25Hz sample rate

#plot with different title
plotObj = hp.plotter(working_data, measures, title='Heart Beat Detection on Noisy Signal', show=False)

plotObj.savefig('plot_1.jpg')
plotObj.show()