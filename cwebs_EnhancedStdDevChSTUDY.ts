# Copyright (c) 2023 cobwebscripts.
# Subject to the MIT (Expat) license.
# See file LICENSE for full license details.

# webs_StandardDevChannel
# Version: 20240616_v00

### FUNCTION DEFINITIONS ###
# I removed the function definitions, but I am keeping these comments here for their usefulness.
# Thinkscript has the ability to make user-defined functions (UDFs)
# through the "script" reserved word.
# You can then reference them using the "reference" reserved word or
# with the short-hand notation using parathensis. 


### DRIVER CODE ###

# price = type of price data.
# deviations = how many standard deviations the upper and lower band should be.
# fullRange = overrides the length/startDate parameters and generates the chart for all available data.
# extendRight = continues the graph to the right, if you have any expansion area.
## You can access the expansion area by going to: Charts > Chart Settings > Time axis > Expansion area
# regressionType = exponential or linear graphing
# rangeType = define the data set either by how many bars back (length) or by where to start
## calculating (start date).
# length = how many bars back.
# startDate = starting data point. The format is YYYYMMDD.
## There is no date validation at this time, so invalid dates result in no graph being drawn.
## If the graph has a lower resolution time, such as a monthly chart, it will truncate the date
## to the nearest month rounded down.
## For example, on a monthly chart, Jan 20, 1970 (19700120), will snap to the Jan 1970.
input price = close;
input deviations = 2.0;
input fullRange = Yes;
input extendRight = Yes;
input regressionType = {default EXPONENTIAL, LINEAR};
input rangeType = {default length, "start date"};
input length = 21;
input startDate = 19700101;

# Thinkscript does not allow reassignment so additional holder variables needed.
def priceVar;
def regression;
def stdDeviation;
def finalRegression;

# Check which regression required.
# I use switch because thinkScript if statements forces usage of else, so might as well.
# If Exponential we convert the data to a logarithmic form, ln(price).
# We will do analysis on this form and convert back to exponential at the end.
switch (regressionType)
{
    case EXPONENTIAL:
        priceVar = Log(price);
    default:
        priceVar = price;
}

# If user wants the full range, we can skip past worrying about range types.
# Otherwise we need to differentiate.
# I put an infinity constant for the length in the start date scenario because InertiaAll and StdevAll
# require a number in length even if we are using the start date.
if (fullRange)
{
    regression = InertiaAll(data = priceVar, extendToRight = extendRight);
    stdDeviation = StDevAll(data = price, extendToRight = extendRight);
}
else
{
    switch (rangeType)
    {
        case length:
            regression = InertiaAll(data = priceVar, length = length, extendToLeft = fullRange, extendToRight = extendRight);
            stdDeviation = StDevAll(data = price, length = length, extendToLeft = fullRange, extendToRight = extendRight);

        case "start date":
            regression = InertiaAll(data = priceVar, length = Double.POSITIVE_INFINITY, startDate = startDate, extendToLeft = fullRange, extendToRight = extendRight);
            stdDeviation = StDevAll(data = price, length = Double.POSITIVE_INFINITY, startDate = startDate, extendToLeft = fullRange, extendToRight = extendRight);
    }
}
        
# If we did exponential regression, convert the data back to its original form by doing
# e^regression.
switch (regressionType)
{
    case EXPONENTIAL:
        finalRegression = Exp(regression);
    default:
        finalRegression = regression;
}

plot UpperLine = finalRegression + deviations * stdDeviation;
plot MiddleLine = finalRegression;
plot LowerLine = finalRegression - deviations * stdDeviation;


UpperLine.SetDefaultColor(GetColor(8));
MiddleLine.SetDefaultColor(GetColor(8));
LowerLine.SetDefaultColor(GetColor(8));

