using Newtonsoft.Json;
using Pric.DB;
using Pric.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Pric.Controllers
{
	[Authorize]
    public class AdminValuesController : ApiController
    {
        private IUserModel _user;
        private ITokenModel _token;
        private IPageModel _page;

        public AdminValuesController(IUserModel userModel, ITokenModel token, IPageModel page)
        {
            _page = page;
            _user = userModel;
            _token = token;
        }
		
        public object Get(string sectionName)
        {
            object jsonObject = null;

            if (!string.IsNullOrEmpty(sectionName))
            {
                IEnumerable<string> headerValues;
                var tokenValue = string.Empty;
                if (Request.Headers.TryGetValues("X-Token", out headerValues))
                {
                    tokenValue = headerValues.FirstOrDefault();
                }

                if (!string.IsNullOrEmpty(tokenValue))
                {
                    if (_token.IsValid(tokenValue))
                    {
                        _token.UpdateToken(tokenValue, DateTime.Now.AddHours(1));
                        jsonObject = _page.GetData(sectionName);
                    }
                }
            }
            return jsonObject;
        }

        public TokenRequestModel Post(UserRequestModel user)
        {
            if (user != null)
            {
                if (_user.IsValid(user.Name, user.Password))
                {
                    Random random = new Random();
                    var value = random.Next(100, 1000);
                    TokenRequestModel token = new TokenRequestModel { Value = value.ToString(), Expiredate = DateTime.Now.AddHours(1) };

                    _token.UpdateToken(value.ToString(), DateTime.Now.AddHours(1));

                    return token;
                }
            }
            return null;
        }
    }
}