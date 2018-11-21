const helmet = require('helmet');

module.exports = app => {
  // # helmet https://helmetjs.github.io/docs/
  // helmet은 보안 관련 HTTP 헤더를 설정 모음
  app.use(helmet());

  // # contentSecurityPolicy for setting Content Security Policy
  // csp는 Content-Security-Policy 헤더를 설정하여 XSS(Cross-site scripting) 공격 및 기타 교차 사이트 인젝션을 예방합니다.
  /*
	app.use(helmet.contentSecurityPolicy({
		// Specify directives as normal.
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'"]
		}
	}));
	*/

  // # crossdomain for handling Adobe products’ crossdomain requests
  // Adobe 제품의 교차 도메인 요청 처리를위한 크로스 도메인
  app.use(helmet.permittedCrossDomainPolicies());

  // # dnsPrefetchControl controls browser DNS prefetching
  // 브라우저 DNS 프리 페치를 제어하는 dnsPrefetchControl
  app.use(helmet.dnsPrefetchControl());

  // # expectCt for handling Certificate Transparency
  // 인증서 투명성 처리를위한 expectCt
  //app.use(expectCt({ maxAge: 123 }));

  // # frameguard
  // frameguard는 X-Frame-Options 헤더를 설정하여 clickjacking에 대한 보호를 제공합니다.
  app.use(helmet.frameguard());

  // # hidePoweredBy
  // hidePoweredBy는 X-Powered-By 헤더를 제거합니다.
  app.use(
    helmet.hidePoweredBy({
      setTo: 'ASP.NET 2.1.8'
    })
  );

  // # hpkp
  // hpkp는 Public Key Pinning 헤더를 추가하여, 위조된 인증서를 이용한 중간자 공격을 방지합니다.
  const ninetyDaysInSeconds = 7776000;
  app.use(
    helmet.hpkp({
      maxAge: ninetyDaysInSeconds,
      sha256s: ['AbCdEf123=', 'ZyXwVu456='],
      includeSubDomains: true, // optional
      reportUri: 'http://example.com', // optional
      reportOnly: false, // optional

      // Set the header based on a condition.
      // This is optional.
      setIf(req, res) {
        return req.secure;
      }
    })
  );

  // # hsts
  // hsts는 서버에 대한 안전한(SSL/TLS를 통한 HTTP) 연결을 적용하는 Strict-Transport-Security 헤더를 설정합니다.
  const sixtyDaysInSeconds = 5184000;
  app.use(
    helmet.hsts({
      maxAge: sixtyDaysInSeconds
    })
  );

  // # ieNoOpen
  // ieNoOpen은 IE8 이상에 대해 X-Download-Options를 설정합니다.
  app.use(helmet.ieNoOpen());

  // # nocache
  // noCache는 Cache-Control 및 Pragma 헤더를 설정하여 클라이언트 측에서 캐싱을 사용하지 않도록 합니다.
  app.use(helmet.noCache());

  // # noSniff
  // noSniff는 X-Content-Type-Options 를 설정하여, 선언된 콘텐츠 유형으로부터 벗어난 응답에 대한 브라우저의 MIME 가로채기를 방지합니다.
  app.use(helmet.noSniff());

  // # referrerPolicy
  app.use(
    helmet.referrerPolicy({
      policy: 'same-origin'
    })
  );

  // # xssFilter
  // xssFilter는 X-XSS-Protection을 설정하여 대부분의 최신 웹 브라우저에서 XSS(Cross-site scripting) 필터를 사용하도록 합니다.
  app.use(helmet.xssFilter());

  // # disable x-powered-by
  app.disable('x-powered-by');
};
