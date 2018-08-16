using System;
using System.Web;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Forex.Web.TwitterReference;
using sharedsource_verndale._Classes.Global;
using Forex.Logging.Components._Global;
using System.Collections.Generic;
using System.Linq;

namespace Forex.Web._Classes.Shared.Helpers
{
    public static class GlobalHelper
    {
        public static string GetTwitterFeed(string accountName, string consumerKey, string consumerSecret, string accessToken, string accessTokenSecret, int count)
        {
            string twtData = null;
            try
            {
                TwitterSoapClient otwt = new TwitterSoapClient("TwitterSoap");
                twtData = otwt.GetTwitterContent(accountName, consumerKey, consumerSecret, accessToken, accessTokenSecret, count);
            }
            catch (Exception ex)
            {
                LogHelper.Info("Twitter Feed asmx error.");
                LogHelper.Error(ex.Message, ex);
            }

            return twtData;
        }

        public static string TruncTextToNumOfWords(string str, int maxWordsCount, bool appendEllipses = false)
        {
            if (maxWordsCount != str.Length)
            {
                if (string.IsNullOrWhiteSpace(str)) return string.Empty;
                if (maxWordsCount > str.Split(' ', '.').Length) return str;
                if (maxWordsCount == str.Length) return str;
                for (int itr = 0; itr < str.Length; itr++)
                {
                    if (str[itr] == ' ' || str[itr] == '.')
                    {
                        maxWordsCount--;
                    }
                    if (maxWordsCount == 0)
                    {
                        return str.Substring(0, itr) + ((str.Substring(0, itr).Length < str.Length) && appendEllipses ? "..." : string.Empty);
                    }
                }
                return str;
            }
            else
            {
                return str;
            }
        }
		
        public static string TruncTextToNumOfChars(string str, int maxCharCount, bool appendEllipses = false)
        {
            if (string.IsNullOrWhiteSpace(str)) return string.Empty;

            var originalStrLen = str.Length;

            if (str.Length > maxCharCount)
            {
                str = str.Substring(0, maxCharCount);

                return str + ((str.Length < originalStrLen) && appendEllipses ? "..." : string.Empty);
            }
            else
            {
                return str;
            }
        }

        public static string GetIpAddress()
        {
            string userIp = string.Empty;
            try
            {
                if (HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null && HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString().Length > 0)
                {
                    string strIP = HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
                    string[] ipArray = strIP.Split(',');
                    if (ipArray.Length > 0)
                    {
                        userIp = ipArray[0].ToString().Trim();
                    }
                }
                else
                    userIp = HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"].ToString();
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message, ex);
                userIp = HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"].ToString();
            }

            if (userIp == "::1")
                userIp = "127.0.0.1";

            return userIp;
        }

        public static string ReadCookie(string cookieName)
        {
            HttpCookie myCookie = new HttpCookie(cookieName);
            myCookie = HttpContext.Current.Request.Cookies[cookieName];

            if (myCookie != null)
                return myCookie.Value;
            else
                return string.Empty;
        }

        public static void WriteCookie(string name, string value)
        {
            HttpContext.Current.Response.Cookies.Add(NewCookie(name, value));
        }

        public static void WriteCookie(string name, string value, double milliSeconds)
        {
            HttpContext.Current.Response.Cookies.Add(NewCookie(name, value, milliSeconds));
        }

        private static string getHostName(string hostUrl)
        {
            string host = hostUrl;

            if (hostUrl.Length > 0 && hostUrl.IndexOf('.') > 0)
            {
                host = "";
                string[] hArray = hostUrl.Split('.');

                for (int i = 1; i < hArray.Length; i++)
                {
                    if (host.Length > 0)
                        host += '.' + hArray[i].ToString();
                    else
                        host += hArray[i].ToString();
                }
            }

            return host;
        }
        
    }
}