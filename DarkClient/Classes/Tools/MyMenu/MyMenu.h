#ifndef _MyMenu_H_
#define _MyMenu_H_

#include "cocos2d.h"

USING_NS_CC;

/*÷ÿ–¥Menu¿‡£¨ ß∞‹∆∑*/

class MyMenu : public Menu{
public:
	static Menu * create(MenuItem* item, ...);
	static Menu* createWithArray(const Vector<MenuItem*>& arrayOfItems);
	static Menu* createWithItems(MenuItem* item, va_list args);
	bool initWithArray(const Vector<MenuItem*>& arrayOfItems);
};

#endif