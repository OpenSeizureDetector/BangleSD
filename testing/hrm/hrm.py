''' Off-line analysis of Banglejs2 HRM output which is saved using
https://banglejs.com/apps/?id=hrmaccevents
Note:  You do not see the event numbers increasing on-screen during
capture, but selecting the 'Download CSV' option does work once it has
saved some data.
'''

import pandas as pd
import matplotlib.pyplot as plt

startX = 100
endX = 110


#fname = "log_withGarminOptical_BTHRM.csv"
fname = "HRM_data_walking.csv"

#fp = open(fname,'r')

df = pd.read_csv(fname)
print(df)
#df = df.dropna(subset='PPG_r')
df['timesecs'] = (df['datetime']-df['datetime'].iloc[0])
df['timediff'] = df['timesecs'] - df['timesecs'].shift(1)

df['raw_av'] = df['raw'].rolling(5).mean()
df['raw_diff'] = df['raw']-df['raw_av']



print(df)


# Tidy the data a bit
print("Tidying Data...")
#We get big variations where there is a step change in the HRM output
#In this case we just replace the value with the mean (~0)
rawDiffMean = df['raw_diff'].mean()
rawDiffStd = df['raw_diff'].std()

lowTh = -3*rawDiffStd
highTh = 3*rawDiffStd

rawDiffOutliers = df[(df['raw_diff'] < lowTh) | (df['raw_diff'] > highTh)]
print(rawDiffOutliers)

df['raw_diff'] = df['raw_diff'].mask((df['raw_diff'] < lowTh) | (df['raw_diff'] > highTh), 0)
print("Plotting Data")

newRawDiffOutliers = df[(df['raw_diff'] < lowTh) | (df['raw_diff'] > highTh)]
print(newRawDiffOutliers)

# Calculate smoothed raw_diff
df['raw_diff_av'] = df['raw_diff'].rolling(10).mean()



fig, ax = plt.subplots(3,1)
fig.set_size_inches(8,10)
df.plot(ax=ax[0], x='timesecs',y='raw')
df.plot(ax=ax[0], x='timesecs',y='raw_av')
df.plot(ax=ax[1], x='timesecs',y='raw_diff')
df.plot(ax=ax[1], x='timesecs',y='raw_diff_av')
df.plot(ax=ax[2], x='timesecs', y='timediff')
ax[0].set(xlim=(startX, endX))
ax[1].set(xlim=(startX, endX))
ax[1].grid('both')
ax[2].set(xlim=(startX, endX))
ax[1].set(ylim=(-500, 500))
fig.tight_layout()
plt.show()
