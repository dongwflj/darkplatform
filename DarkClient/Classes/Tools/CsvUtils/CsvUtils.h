#ifndef __CsvUtils_H__
#define __CsvUtils_H__

#include "cocos2d.h"

USING_NS_CC;

/*读取csv文件，主要作用是显示中文*/

class CsvUtils : public Ref{
public:
	CsvUtils();
	~CsvUtils();

	static CsvUtils * getInstance();

	virtual bool init();

	void loadFile(const std::string & fileName);
	void splitString(std::vector<std::string> &vec, std::string & sSrc, const std::string & sSep);		//根据分隔符分隔字符串
	std::string getMapData(int row, int col, const std::string & fileName);		//获取指定行列字符串
	Size getFileRowCount(const std::string & fileName);		//获取文件行数
private:
	static CsvUtils * s_CsvUtils;
	std::map<std::string, std::vector<std::vector<std::string>>> _map;
};


#endif