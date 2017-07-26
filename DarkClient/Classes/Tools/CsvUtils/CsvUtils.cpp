#include "CsvUtils.h"

CsvUtils * CsvUtils::s_CsvUtils = NULL;

CsvUtils::CsvUtils()
{

}

CsvUtils::~CsvUtils()
{

}

CsvUtils * CsvUtils::getInstance()
{
	if (!s_CsvUtils)
	{
		s_CsvUtils = new CsvUtils();
		if (s_CsvUtils && s_CsvUtils->init())
		{
			s_CsvUtils->autorelease();
		}
		else
		{
			CC_SAFE_DELETE(s_CsvUtils);
		}
	}
	return s_CsvUtils;
}

bool CsvUtils::init()
{
	return true;
}

void CsvUtils::loadFile(const std::string & fileName)
{
	std::vector<std::vector<std::string>> vec;

	std::string fileData = FileUtils::getInstance()->getStringFromFile(fileName);
	//log(fileData.c_str());
	std::vector<std::string> lines;
	splitString(lines, fileData, "\r\n");

	/* 把每一行的字符串拆分出来（按逗号分隔） */
	for (auto line : lines)
	{
		std::vector<std::string> lineData;
		splitString(lineData, line, ",");
		vec.push_back(lineData);
	}

	/* 添加列表到字典里 */
	_map[fileName] = vec;

}

void CsvUtils::splitString(std::vector<std::string> &vec, std::string & sSrc, const std::string & sSep)
{
	int startIndex = 0;
	int sepLen = sSep.length();
	int endIndex = sSrc.find(sSep);
	int length = sSrc.size();
	/* 根据换行符拆分字符串，并添加到列表中 */

	while (endIndex != std::string::npos) {
		/* 截取一行字符串 */
		vec.push_back(sSrc.substr(startIndex, endIndex));
		sSrc = sSrc.substr(endIndex + sepLen, length);
		endIndex = sSrc.find(sSep);
	}

	/* 剩下的字符串也添加进列表 */
	if (sSrc.compare("") != 0)
	{
		vec.push_back(sSrc);
	}
}

std::string CsvUtils::getMapData(int row, int col, const std::string & fileName)
{
	/* 取出配置文件的二维表格 */
	auto vec = _map[fileName];

	/* 如果配置文件的数据不存在，则加载配置文件 */
	if (vec.size() == 0)
	{
		loadFile(fileName);
		vec = _map[fileName];
	}

	int rowNum = vec.size();
	int colNum = vec[0].size();

	/* 下标越界 */
	if (row < 0 || row >= rowNum || col < 0 || col >= colNum)
	{
		return "";
	}

	return vec[row][col];

}

Size CsvUtils::getFileRowCount(const std::string & fileName)
{
	/* 取出配置文件的二维表格 */
	auto vec = _map[fileName];

	/* 如果配置文件的数据不存在，则加载配置文件 */
	if (vec.size() == 0)
	{
		loadFile(fileName);
		vec = _map[fileName];
	}

	int rowNum = vec.size();
	int colNum = vec[0].size();

	return Size(rowNum, colNum);
}