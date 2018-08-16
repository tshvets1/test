using Pric.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Pric.Controllers
{
    public class NewsController : ApiController
    {
        private INewsService _newsService;

        private string _contentFile;

        public NewsController(INewsService newsService, string contentFile)
        {
            _newsService = newsService;
			_contentFile = contentFile;
        }

        // GET api/values
        [HttpPost]
        public object Post([FromBody]string newsArrayObject)
        {
            object sectionObject = null;
            if (!string.IsNullOrEmpty(newsArrayObject))
            {
                sectionObject = _newsService.UpdateNewsArray(_contentFile, newsArrayObject);
            }

            return sectionObject;
        }
    }
}