# Chrome Prefabs
### Browser navigation with organization based on domain prefixes.

### Note
I built this from a chrome extension I hacked. Because of the license in the original version, I don't think I can publicly distribute the code. If I misunderstood the contract, or you would like to see the code, let me know.


## Purpose

I always have hundreds of tabs open at any given time. When there are that many tabs open all the time, it is impossible to get back to the right one.
There are many reasons someone would have many tabs open, but a couple examples are:
* You need to compare or look at two separate sections of the same website (Development docs in separate locations).
* You have multiple articles (news, buzzfeed, wiki, ...) open from the same website.

Windows, Linux and Osx all have native support for cascading applications into dock icons. So why not add that feature to the browser?

## Vision

My ideal vision for this is that the only tabs that appear in a browser are distinct nth-level domain names (google.com, mail.google.com, facebook.com, github.com). From there, just like in your dock, you would click the tab and a dropdown would open with the different tabs you have open.

## Prototype

Working: Prefixing the urls, clicking on the links opens the tabs, tab count...

Not Implemented: Better styling, page preview, search, collapsed sections...

This prototype is something I mocked up to test this navigation technique. I literally wrote it in less than an hour with no previous knowlege of chrome extensions (this is why it doesn't look too pretty). I'm very happy with how it turned out, it actually does make finding tabs a lot easier, but clearly needs ui work.

The way I got it up so quickly was I found another extension that aggregated the tabs, and I utilized its backend. I stripped the front end out, and placed simple hrefs to get to the tabs.

The original extension is here
http://blog.visibotech.com/p/toomanytabs-for-chrome.html

This version contains little to none of the functional purpose of the original



Here are some screenshots

## Tabs Comparison (Actually a light example usually > 31)

![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/comparison.png)

## Popup view:

![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/shot1.png)


## Clickable Prefixed Tab Locations (github.com)
![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/shot2.png)

## Clickable Prefixed Tab Locations (mail.google.com)
![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/shot3.png)