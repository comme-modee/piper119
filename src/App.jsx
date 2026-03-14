import { useEffect } from 'react'
import './App.css'

function App() {
  useEffect(() => {
    const cleanupFns = []

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle')
    const navMenu = document.getElementById('navMenu')
    const navLinks = document.querySelectorAll('.nav-link')

    if (navToggle && navMenu) {
      const handleNavToggle = () => {
        navMenu.classList.toggle('active')
        const icon = navToggle.querySelector('i')
        if (!icon) return
        if (navMenu.classList.contains('active')) {
          icon.classList.remove('fa-bars')
          icon.classList.add('fa-times')
        } else {
          icon.classList.remove('fa-times')
          icon.classList.add('fa-bars')
        }
      }

      navToggle.addEventListener('click', handleNavToggle)
      cleanupFns.push(() => navToggle.removeEventListener('click', handleNavToggle))
    }

    navLinks.forEach((link) => {
      const closeMenu = () => {
        if (!navMenu || !navToggle) return
        navMenu.classList.remove('active')
        const icon = navToggle.querySelector('i')
        if (!icon) return
        icon.classList.remove('fa-times')
        icon.classList.add('fa-bars')
      }

      link.addEventListener('click', closeMenu)
      cleanupFns.push(() => link.removeEventListener('click', closeMenu))
    })

    // Smooth Scrolling
    const anchors = document.querySelectorAll('a[href^="#"]')
    anchors.forEach((anchor) => {
      const handleAnchorClick = (e) => {
        const href = anchor.getAttribute('href')
        if (!href || href === '#') return
        const target = document.querySelector(href)
        if (!target) return

        e.preventDefault()
        const headerOffset = 80
        const elementPosition = target.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }

      anchor.addEventListener('click', handleAnchorClick)
      cleanupFns.push(() => anchor.removeEventListener('click', handleAnchorClick))
    })

    // Sticky Header + Scroll To Top
    const header = document.querySelector('.header')
    const scrollTopBtn = document.getElementById('scrollTop')

    const handleScroll = () => {
      const currentScroll = window.pageYOffset

      if (header) {
        header.style.boxShadow =
          currentScroll > 100
            ? '0 4px 12px rgba(0, 0, 0, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }

      if (scrollTopBtn) {
        if (currentScroll > 300) {
          scrollTopBtn.classList.add('show')
        } else {
          scrollTopBtn.classList.remove('show')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    cleanupFns.push(() => window.removeEventListener('scroll', handleScroll))
    handleScroll()

    if (scrollTopBtn) {
      const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      scrollTopBtn.addEventListener('click', handleScrollTop)
      cleanupFns.push(() => scrollTopBtn.removeEventListener('click', handleScrollTop))
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item')
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question')
      if (!question) return

      const handleFaqClick = () => {
        const isActive = item.classList.contains('active')
        faqItems.forEach((faq) => faq.classList.remove('active'))
        if (!isActive) item.classList.add('active')
      }

      question.addEventListener('click', handleFaqClick)
      cleanupFns.push(() => question.removeEventListener('click', handleFaqClick))
    })

    // Contact Form Submission + Rate Limiting
    const contactForm = document.getElementById('contactForm')
    let lastSubmitTime = 0
    const SUBMIT_COOLDOWN = 60000

    if (contactForm) {
      const handleSubmit = async (e) => {
        e.preventDefault()

        const currentTime = Date.now()
        if (currentTime - lastSubmitTime < SUBMIT_COOLDOWN) {
          const remainingTime = Math.ceil((SUBMIT_COOLDOWN - (currentTime - lastSubmitTime)) / 1000)
          alert(`⏰ 잠시만 기다려주세요!\n\n다시 전송하려면 ${remainingTime}초 후에 시도해주세요.`)
          return
        }

        const formData = new FormData(contactForm)
        formData.set('form-name', 'contact')

        const name = formData.get('name')
        const phone = formData.get('phone')
        const privacy = formData.get('privacy')

        if (!name || !phone || !privacy) {
          alert('필수 항목을 모두 입력해주세요.')
          return
        }

        const digitsOnly = String(phone).replace(/-/g, '')
        const phoneRegex = /^01[0-9][0-9]{7,8}$/
        if (!phoneRegex.test(digitsOnly)) {
          alert('올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)')
          return
        }

        const submitBtn = contactForm.querySelector('.btn-submit')
        const originalText = submitBtn ? submitBtn.innerHTML : ''

        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...'
          submitBtn.disabled = true
        }

        try {
          const response = await fetch('/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData).toString(),
          })

          if (!response.ok) {
            const text = await response.text()
            console.error('Netlify form error status:', response.status)
            console.error('Netlify form error body:', text)
            throw new Error(`Form submission failed: ${response.status}`)
          }

          alert('✅ 상담 신청이 완료되었습니다!\n\n빠른 시일 내에 연락드리겠습니다.\n감사합니다!')
          contactForm.reset()

          const formInputs = contactForm.querySelectorAll('input, select, textarea')
          formInputs.forEach((input) => {
            if (input.id) localStorage.removeItem(`form_${input.id}`)
          })

          lastSubmitTime = Date.now()
        } catch (error) {
          console.error('Error:', error)
          alert('❌ 전송 중 오류가 발생했습니다.\n\n잠시 후 다시 시도해주시거나\n1670-5119로 전화 주시기 바랍니다.')
        } finally {
          if (submitBtn) {
            submitBtn.innerHTML = originalText
            submitBtn.disabled = false
          }
        }
      }

      contactForm.addEventListener('submit', handleSubmit)
      cleanupFns.push(() => contactForm.removeEventListener('submit', handleSubmit))
    }

    // Kakao Talk Button
    const kakaoBtn = document.getElementById('kakaoBtn')
    if (kakaoBtn) {
      const handleKakao = () => {
        alert('🔔 카카오톡 상담 서비스 준비 중입니다.\n\n지금은 전화 상담(1670-5119)을 이용해주세요!\n빠른 시일 내에 카카오톡 상담도 오픈하겠습니다.')
      }
      kakaoBtn.addEventListener('click', handleKakao)
      cleanupFns.push(() => kakaoBtn.removeEventListener('click', handleKakao))
    }

    // Intersection Observer for Animations
    const animateElements = document.querySelectorAll('.service-card, .target-card, .benefit-card, .process-step')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    animateElements.forEach((element) => {
      element.style.opacity = '0'
      element.style.transform = 'translateY(30px)'
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      observer.observe(element)
    })
    cleanupFns.push(() => observer.disconnect())

    // Phone Number Formatting
    const phoneInput = document.getElementById('phone')
    if (phoneInput) {
      const handlePhoneInput = (e) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 3 && value.length <= 7) {
          value = value.slice(0, 3) + '-' + value.slice(3)
        } else if (value.length > 7) {
          value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
        }
        e.target.value = value
      }
      phoneInput.addEventListener('input', handlePhoneInput)
      cleanupFns.push(() => phoneInput.removeEventListener('input', handlePhoneInput))
    }

    // Pricing section subtle animation
    const pricingSection = document.querySelector('.pricing')
    let counterAnimated = false
    if (pricingSection) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !counterAnimated) {
              counterAnimated = true
              const amounts = document.querySelectorAll('.pricing-amount .amount')
              amounts.forEach((amount) => {
                amount.style.animation = 'fadeInUp 0.8s ease'
              })
            }
          })
        },
        { threshold: 0.3 }
      )
      counterObserver.observe(pricingSection)
      cleanupFns.push(() => counterObserver.disconnect())
    }

    // Konami Code
    let konamiCode = []
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

    const handleKonami = (e) => {
      konamiCode.push(e.key)
      konamiCode = konamiCode.slice(-konamiSequence.length)
      if (konamiCode.join(',') === konamiSequence.join(',')) {
        console.log('%c🎉 축하합니다! 숨겨진 코드를 발견했습니다!', 'color: #f59e0b; font-size: 24px; font-weight: bold;')
        console.log('%c💸 특별 할인 코드: PIPER2024', 'color: #ef4444; font-size: 18px;')
        alert('🎊 축하합니다!\n\n숨겨진 코드를 발견하셨습니다!\n특별 할인 코드: PIPER2024\n\n상담 신청 시 말씀해주세요!')
      }
    }
    document.addEventListener('keydown', handleKonami)
    cleanupFns.push(() => document.removeEventListener('keydown', handleKonami))

    // Auto-save form data to localStorage
    if (contactForm) {
      const formInputs = contactForm.querySelectorAll('input, select, textarea')
      formInputs.forEach((input) => {
        if (input.type !== 'checkbox' && input.id) {
          const savedValue = localStorage.getItem(`form_${input.id}`)
          if (savedValue) input.value = savedValue

          const saveInput = () => {
            localStorage.setItem(`form_${input.id}`, input.value)
          }
          input.addEventListener('input', saveInput)
          cleanupFns.push(() => input.removeEventListener('input', saveInput))
        }
      })
    }

    // CTA click tracking
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .floating-btn')
    ctaButtons.forEach((button) => {
      const handleCtaClick = () => {
        const buttonText = button.textContent?.trim()
        console.log('CTA Clicked:', buttonText)
      }
      button.addEventListener('click', handleCtaClick)
      cleanupFns.push(() => button.removeEventListener('click', handleCtaClick))
    })

    console.log('%c🚀 PIPER 119 - 하수배관 정기구독 서비스', 'color: #1e3a8a; font-size: 20px; font-weight: bold;')
    console.log('%c📞 고객센터: 1670-5119', 'color: #3b82f6; font-size: 14px;')
    console.log('%c💰 월 33,000원으로 1년 내내 편안하게!', 'color: #10b981; font-size: 14px;')
    console.log('✅ PIPER 119 Website Loaded Successfully!')

    return () => cleanupFns.forEach((fn) => fn())
  }, [])

  return (
    <>
      <header className="header">
        <nav className="nav container">
          <div className="nav-logo">
            <img alt="PIPER 119 로고" className="logo-img" src="/images/logo-light.jpg" />
          </div>
          <ul className="nav-menu" id="navMenu">
            <li><a className="nav-link" href="#hero">홈</a></li>
            <li><a className="nav-link" href="#pricing">가격비교</a></li>
            <li><a className="nav-link" href="#service">서비스</a></li>
            <li><a className="nav-link" href="#service-area">서비스지역</a></li>
            <li><a className="nav-link" href="#process">진행과정</a></li>
            <li><a className="nav-link" href="#faq">FAQ</a></li>
            <li><a className="nav-link btn-nav" href="#contact">상담신청</a></li>
          </ul>
          <div className="nav-toggle" id="navToggle">
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>
      <section className="hero" id="hero">
        <div className="hero-overlay"></div>
        <div className="hero-bg-image">
          <img alt="PIPER 119 차량" className="hero-vehicle" src="/images/vehicle-side.jpg" />
        </div>
        <div className="hero-content container">
          <div className="hero-text">
            <h2 className="hero-title">하수배관 <span className="highlight">막히기 전에</span><br />관리해드립니다</h2>
            <p className="hero-subtitle">월 33,000원으로 1년 내내 편안하게</p>
            <div className="hero-stats">
              <div className="stat-item">
                <i className="fas fa-check-circle"></i>
                <p>연 2회 전문 스케일링</p>
              </div>
              <div className="stat-item">
                <i className="fas fa-check-circle"></i>
                <p>내시경 진단 포함</p>
              </div>
              <div className="stat-item">
                <i className="fas fa-check-circle"></i>
                <p>긴급 출동 우선 대응</p>
              </div>
            </div>
            <div className="hero-cta">
              <a className="btn btn-primary" href="tel:1670-5119">
                <i className="fas fa-phone-alt"></i> 1670-5119 전화상담
              </a>
              <a className="btn btn-secondary" href="#contact">무료 상담 신청</a>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <a href="#pricing">
            <i className="fas fa-chevron-down"></i>
          </a>
        </div>
      </section>
      <section className="why-subscription">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">왜 <span className="highlight">구독 서비스</span>를 시작했을까요?</h2>
            <p className="section-subtitle">아무리 잘 뚫어도 다시 막히는 생활하수배관의 역습</p>
          </div>
          <div className="why-intro">
            <p className="why-intro-text">
              수많은 고객들을 만나며 같은 문제가 반복되는 것을 보았습니다.
              <strong>단순히 막힌 배관을 뚫는 것</strong>만으로는 근본적인 해결이 되지 않습니다.
              그래서 <strong className="highlight">예방 중심의 정기 관리</strong>라는 새로운 방식을 제안합니다.
            </p>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-number">01</div>
              <div className="why-icon">
                <i className="fas fa-redo-alt"></i>
              </div>
              <h3>아무리 잘 뚫어도<br />다시 막힙니다</h3>
              <p>
                기름때, 이물질이 배관 벽면에 계속 쌓입니다.
                <strong>3~6개월이면 다시 원점</strong>으로 돌아가죠.
                일시적 해결이 아닌 <strong>지속적 관리</strong>가 필요합니다.
              </p>
              <div className="why-stat">
                <span className="stat-number">78%</span>
                <span className="stat-text">의 고객이 6개월 내 재발 경험</span>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">02</div>
              <div className="why-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>갑작스러운 막힘<br />최악의 타이밍</h3>
              <p>
                손님이 많은 주말, 중요한 행사 당일...
                <strong>가장 바쁠 때 막힙니다.</strong>
                정기 관리로 <strong>불시의 상황을 사전 차단</strong>하세요.
              </p>
              <div className="why-stat">
                <span className="stat-number">평균 2시간</span>
                <span className="stat-text">영업 중단 시간 (막힘 발생 시)</span>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">03</div>
              <div className="why-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>업무시간을 피해<br />조용히 관리</h3>
              <p>
                영업 전 아침, 마감 후 저녁, 휴무일...
                <strong>고객님 일정에 맞춰</strong> 방문합니다.
                영업에 지장 없이 <strong>조용히 완료</strong>합니다.
              </p>
              <div className="why-stat">
                <span className="stat-number">오전 8시~10시</span>
                <span className="stat-text">가장 선호하는 점검 시간</span>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">04</div>
              <div className="why-icon">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <h3>긴급 출동비용<br />걱정 끝</h3>
              <p>
                막힐 때마다 <strong>30~100만원</strong> 지출.
                월 33,000원으로 <strong>1년 내내 안심</strong>하세요.
                예측 가능한 고정비로 <strong>예산 관리</strong>도 쉽습니다.
              </p>
              <div className="why-stat">
                <span className="stat-number">연 60만원</span>
                <span className="stat-text">평균 절약 금액 (구독 시)</span>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">05</div>
              <div className="why-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>내시경으로<br />정확한 진단</h3>
              <p>
                눈에 보이지 않는 배관 내부 상태를
                <strong>내시경으로 확인</strong>합니다.
                문제를 사전에 발견해 <strong>큰 비용 예방</strong>합니다.
              </p>
              <div className="why-stat">
                <span className="stat-number">100%</span>
                <span className="stat-text">내시경 진단 포함 (추가 비용 無)</span>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">06</div>
              <div className="why-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>점검 기록으로<br />이력 관리</h3>
              <p>
                매회 <strong>점검 리포트</strong>와 사진을 제공합니다.
                배관 상태 변화를 추적하고
                <strong>최적의 관리 시기</strong>를 안내받으세요.
              </p>
              <div className="why-stat">
                <span className="stat-number">사진+동영상</span>
                <span className="stat-text">점검 결과 자료 제공</span>
              </div>
            </div>
          </div>
          <div className="why-conclusion">
            <div className="conclusion-content">
              <h3>단순한 뚫음 서비스가 아닙니다</h3>
              <p>
                PIPER 119는 <strong>"막히기 전 예방"</strong>에 집중합니다.
                정기적인 관리로 배관 수명을 연장하고,
                갑작스러운 불편함을 사전에 차단하여
                <strong>고객님의 소중한 시간과 비용을 아껴드립니다.</strong>
              </p>
              <a className="btn btn-primary" href="#contact">지금 바로 상담 신청하기</a>
            </div>
          </div>
        </div>
      </section>
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">나에게 맞는 <span className="highlight">플랜 선택</span></h2>
            <p className="section-subtitle">가정집부터 음식점까지, 맞춤형 구독 서비스</p>
          </div>
          <div className="pricing-comparison">
            <div className="pricing-card pricing-card-standard">
              <div className="pricing-badge">스탠다드</div>
              <div className="pricing-icon">
                <i className="fas fa-home"></i>
              </div>
              <h3>가정집 / 소규모 매장</h3>
              <div className="pricing-amount">
                <span className="currency">₩</span>
                <span className="amount">33,000</span>
                <span className="period">/월</span>
              </div>
              <ul className="pricing-features">
                <li><i className="fas fa-check"></i> 연 2회 배관 스케일링</li>
                <li><i className="fas fa-check"></i> 연 2회 내시경 진단</li>
                <li><i className="fas fa-check"></i> 긴급 출동 우선 대응</li>
                <li><i className="fas fa-check"></i> 구독 중 무상 재시공</li>
                <li><i className="fas fa-check"></i> 관리 리포트 제공</li>
                <li><i className="fas fa-check"></i> 고압세척 30% 할인</li>
              </ul>
              <div className="pricing-total">
                <p>연간</p>
                <h4>396,000원</h4>
              </div>
              <a className="btn btn-secondary" href="#contact">상담 신청</a>
            </div>
            <div className="pricing-card pricing-card-premium featured">
              <div className="pricing-badge popular">BEST</div>
              <div className="pricing-icon">
                <i className="fas fa-store"></i>
              </div>
              <h3>음식점 / 소형빌딩(3층)</h3>
              <div className="pricing-amount">
                <span className="currency">₩</span>
                <span className="amount">66,000</span>
                <span className="period">/월</span>
              </div>
              <ul className="pricing-features">
                <li><i className="fas fa-check"></i> <strong>연 1회 고압세척 포함</strong> ⭐</li>
                <li><i className="fas fa-check"></i> 연 2회 배관 관리 (1회 고압세척)</li>
                <li><i className="fas fa-check"></i> 연 2회 내시경 진단</li>
                <li><i className="fas fa-check"></i> 긴급 출동 우선 대응</li>
                <li><i className="fas fa-check"></i> 구독 중 무상 재시공</li>
                <li><i className="fas fa-check"></i> 상세 리포트 + 사진/동영상</li>
                <li><i className="fas fa-check"></i> 추가 고압세척 30% 할인</li>
                <li><i className="fas fa-check"></i> 유지보수 컨설팅</li>
              </ul>
              <div className="pricing-total">
                <p>연간</p>
                <h4>792,000원</h4>
                <span className="value-note">실제 가치 85만원 이상!</span>
              </div>
              <a className="btn btn-primary" href="#contact">프리미엄 상담</a>
            </div>
          </div>
          <div className="savings-highlight">
            <div className="savings-content">
              <i className="fas fa-star"></i>
              <div>
                <h3>💡 프리미엄 플랜 추천 대상</h3>
                <p><strong>음식점 (한식·중식·치킨)</strong>, <strong>카페</strong>, <strong>소형 빌딩(3층까지)</strong> - 기름 배관으로 자주 막히시는 분들께 최적!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="onetime-service">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">일회성 서비스도 <span className="highlight">PIPER 119</span></h2>
            <p className="section-subtitle">구독이 부담스러우신가요? 정찰제 가격으로 투명하게 안내합니다</p>
          </div>
          <div className="onetime-intro">
            <div className="intro-card">
              <i className="fas fa-shield-alt"></i>
              <h3>정찰제 운영</h3>
              <p>바가지 걱정 없는 명확한 가격표</p>
            </div>
            <div className="intro-card">
              <i className="fas fa-user-check"></i>
              <h3>전문 기술력</h3>
              <p>전문가의 정확한 진단과 시공</p>
            </div>
            <div className="intro-card">
              <i className="fas fa-tools"></i>
              <h3>최신 장비</h3>
              <p>플렉스 샤프트, 내시경 등 보유</p>
            </div>
          </div>
          <div className="price-tables">
            <div className="price-table-section">
              <div className="price-table-header">
                <i className="fas fa-wrench"></i>
                <h3>배관 스케일링 (플렉스 샤프트)</h3>
                <p>배관 내부 스케일을 제거하는 전문 서비스</p>
              </div>
              <div className="price-table">
                <div className="price-row price-row-header">
                  <div className="price-col">구분</div>
                  <div className="price-col">대상</div>
                  <div className="price-col">일반 가격</div>
                  <div className="price-col highlight">멤버십 혜택</div>
                </div>
                <div className="price-row">
                  <div className="price-col"><strong>기본형</strong></div>
                  <div className="price-col" data-label="대상">가정집 싱크대, 욕실 바닥</div>
                  <div className="price-col price-amount" data-label="일반 가격">150,000원</div>
                  <div className="price-col price-membership" data-label="멤버십 혜택">
                    <span className="badge-free">연 2회 무료</span>
                  </div>
                </div>
                <div className="price-row">
                  <div className="price-col"><strong>복합형</strong></div>
                  <div className="price-col" data-label="대상">다세대 메인 배관, 빌딩 공용 비트</div>
                  <div className="price-col price-amount" data-label="일반 가격">별도 견적</div>
                  <div className="price-col price-membership" data-label="멤버십 혜택">
                    <span className="badge-discount">회원가 적용</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="price-table-section">
              <div className="price-table-header">
                <i className="fas fa-shower"></i>
                <h3>고압세척 서비스</h3>
                <p>배관 전체를 고압의 물로 씻어내는 특수 공사</p>
              </div>
              <div className="price-table">
                <div className="price-row price-row-header">
                  <div className="price-col">작업 규모</div>
                  <div className="price-col">일반 가격</div>
                  <div className="price-col highlight">멤버십 할인가</div>
                  <div className="price-col">절약 금액</div>
                </div>
                <div className="price-row">
                  <div className="price-col"><strong>기본 작업</strong></div>
                  <div className="price-col price-amount" data-label="일반 가격">500,000원</div>
                  <div className="price-col price-discount" data-label="멤버십 할인가">
                    <span className="original">500,000원</span>
                    <span className="discounted">350,000원</span>
                  </div>
                  <div className="price-col price-save" data-label="절약 금액">-150,000원</div>
                </div>
                <div className="price-row">
                  <div className="price-col"><strong>표준 작업</strong></div>
                  <div className="price-col price-amount" data-label="일반 가격">700,000원</div>
                  <div className="price-col price-discount" data-label="멤버십 할인가">
                    <span className="original">700,000원</span>
                    <span className="discounted">490,000원</span>
                  </div>
                  <div className="price-col price-save" data-label="절약 금액">-210,000원</div>
                </div>
                <div className="price-row">
                  <div className="price-col"><strong>특수 작업</strong></div>
                  <div className="price-col price-amount" data-label="일반 가격">900,000원</div>
                  <div className="price-col price-discount" data-label="멤버십 할인가">
                    <span className="original">900,000원</span>
                    <span className="discounted">630,000원</span>
                  </div>
                  <div className="price-col price-save" data-label="절약 금액">-270,000원</div>
                </div>
              </div>
              <div className="discount-notice">
                <i className="fas fa-percentage"></i>
                <p><strong>멤버십 회원 30% 할인!</strong> 고압세척이 필요할 때 큰 부담 없이 이용하세요.</p>
              </div>
            </div>
          </div>
          <div className="onetime-cta">
            <div className="cta-box">
              <div className="cta-box-content">
                <h3>💡 이런 분들께 추천합니다</h3>
                <ul className="recommendation-list">
                  <li><i className="fas fa-check-circle"></i> 당장 급하게 막혀서 해결이 필요하신 분</li>
                  <li><i className="fas fa-check-circle"></i> 일시적으로 거주하시는 분 (전세, 월세)</li>
                  <li><i className="fas fa-check-circle"></i> 1년에 1회 미만으로 막히시는 분</li>
                </ul>
              </div>
              <div className="cta-box-action">
                <a className="btn btn-secondary" href="tel:1670-5119">
                  <i className="fas fa-phone-alt"></i> 1670-5119
                </a>
                <p className="cta-note">전화 상담 후 정확한 견적을 받아보세요</p>
              </div>
            </div>
            <div className="comparison-box">
              <h4>📊 언제 멤버십이 유리할까요?</h4>
              <div className="comparison-content">
                <div className="comparison-item">
                  <div className="comparison-label">연 2회 이상 막힘</div>
                  <div className="comparison-arrow">→</div>
                  <div className="comparison-result membership">멤버십 강력 추천</div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">장기 거주 예정</div>
                  <div className="comparison-arrow">→</div>
                  <div className="comparison-result membership">멤버십 유리</div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">음식점/카페 운영</div>
                  <div className="comparison-arrow">→</div>
                  <div className="comparison-result membership">멤버십 필수</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="service" id="service">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">PIPER 119 <span className="highlight">구독 서비스</span></h2>
            <p className="section-subtitle">월 33,000원에 포함된 프리미엄 혜택</p>
          </div>
          <div className="service-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-gift"></i>
              </div>
              <h3>웰컴 케어</h3>
              <p>가입 즉시 배관 대청소 1회 + 천연 피톤치드 공간 살균 소독 제공</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h3>정기 스케일링</h3>
              <p>6개월 주기 연 2회 정밀 스케일링으로 배관 컨디션 최상 유지</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-video"></i>
              </div>
              <h3>내시경 진단</h3>
              <p>배관 내부 상태를 정확하게 확인하는 내시경 촬영 포함</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h3>전문 장비 진단</h3>
              <p>최신 내시경 카메라 및 고압세척기로 전문적인 관리</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-ambulance"></i>
              </div>
              <h3>365일 긴급 출동 0원</h3>
              <p>구독 기간 중 단순 막힘 발생 시 출장비·작업비 전액 무료</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-percent"></i>
              </div>
              <h3>고압세척 30% 할인</h3>
              <p>고압세척 필요 시 50~90만원 → 35~63만원 (30% 할인)</p>
            </div>
          </div>
        </div>
      </section>
      <section className="vehicle-gallery">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">PIPER 119 <span className="highlight">전문 차량</span></h2>
            <p className="section-subtitle">전문 장비를 갖춘 서비스 차량</p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img alt="PIPER 119 차량 전면" loading="lazy" src="/images/vehicle-front.jpg" />
              <div className="gallery-overlay">
                <h3>전문 서비스 차량</h3>
                <p>최신 장비 완비</p>
              </div>
            </div>
            <div className="gallery-item">
              <img alt="PIPER 119 차량 측면" loading="lazy" src="/images/vehicle-side.jpg" />
              <div className="gallery-overlay">
                <h3>신속한 출동</h3>
                <p>24시간 대기</p>
              </div>
            </div>
            <div className="gallery-item">
              <img alt="PIPER 119 차량 후면" loading="lazy" src="/images/vehicle-back.jpg" />
              <div className="gallery-overlay">
                <h3>전문 장비 보유</h3>
                <p>고압세척, 내시경 진단</p>
              </div>
            </div>
          </div>
          <div className="vehicle-features">
            <div className="feature-item">
              <i className="fas fa-tools"></i>
              <h4>전문 장비</h4>
              <p>고압세척기, 내시경 등 최신 장비 보유</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-truck"></i>
              <h4>신속 출동</h4>
              <p>구독 고객 우선 대응 시스템</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-shield-alt"></i>
              <h4>안전 관리</h4>
              <p>보험 가입 및 안전 장비 완비</p>
            </div>
          </div>
        </div>
      </section>
      <section className="target-solution">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">이런 분들께 <span className="highlight">추천합니다</span></h2>
            <p className="section-subtitle">업종별 맞춤 솔루션</p>
          </div>
          <div className="target-grid">
            <div className="target-card">
              <div className="target-image">
                <i className="fas fa-utensils"></i>
              </div>
              <h3>음식점 / 카페</h3>
              <p className="target-problem">"기름 배관, 자주 막히세요?"</p>
              <ul className="target-benefits">
                <li><i className="fas fa-check"></i> 기름때 축적 예방</li>
                <li><i className="fas fa-check"></i> 영업 중단 걱정 없음</li>
                <li><i className="fas fa-check"></i> 위생 점검 대비 완벽</li>
              </ul>
              <p className="target-save">연 20만원 이상 절약</p>
            </div>
            <div className="target-card">
              <div className="target-image">
                <i className="fas fa-building"></i>
              </div>
              <h3>건물주 / 임대인</h3>
              <p className="target-problem">"세입자 민원, 스트레스 받으시나요?"</p>
              <ul className="target-benefits">
                <li><i className="fas fa-check"></i> 세입자 민원 사전 예방</li>
                <li><i className="fas fa-check"></i> 건물 가치 유지</li>
                <li><i className="fas fa-check"></i> 긴급 상황 우선 대응</li>
              </ul>
              <p className="target-save">건물 관리비 절감</p>
            </div>
            <div className="target-card">
              <div className="target-image">
                <i className="fas fa-cut"></i>
              </div>
              <h3>미용실 / 세탁소</h3>
              <p className="target-problem">"머리카락·이물질로 막히시나요?"</p>
              <ul className="target-benefits">
                <li><i className="fas fa-check"></i> 머리카락 막힘 예방</li>
                <li><i className="fas fa-check"></i> 악취 문제 해결</li>
                <li><i className="fas fa-check"></i> 고객 불편 최소화</li>
              </ul>
              <p className="target-save">긴급 출동 비용 절감</p>
            </div>
          </div>
        </div>
      </section>
      <section className="process" id="process">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">간단한 <span className="highlight">4단계</span> 프로세스</h2>
            <p className="section-subtitle">복잡한 절차 없이 쉽고 빠르게</p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="process-number">01</div>
              <div className="process-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <h3>무료 상담 신청</h3>
              <p>전화 또는 온라인으로<br />간편하게 상담 신청</p>
            </div>
            <div className="process-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="process-step">
              <div className="process-number">02</div>
              <div className="process-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>현장 방문·진단</h3>
              <p>전문가가 현장 방문하여<br />배관 상태 무료 진단</p>
            </div>
            <div className="process-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="process-step">
              <div className="process-number">03</div>
              <div className="process-icon">
                <i className="fas fa-file-signature"></i>
              </div>
              <h3>구독 시작</h3>
              <p>간편한 계약 체결 후<br />구독 서비스 시작</p>
            </div>
            <div className="process-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="process-step">
              <div className="process-number">04</div>
              <div className="process-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>정기 관리</h3>
              <p>연 2회 정기 스케일링<br />및 지속적 관리</p>
            </div>
          </div>
          <div className="process-cta">
            <a className="btn btn-primary" href="#contact">지금 바로 시작하기</a>
          </div>
        </div>
      </section>
      <section className="service-area" id="service-area">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">서비스 지역 및 <span className="highlight">도착 시간</span></h2>
            <p className="section-subtitle">일산 백석동 출발 기준 예상 도착 시간 안내</p>
          </div>
          <div className="area-content">
            <div className="area-map">
              <div className="map-container">
                <div className="base-location">
                  <i className="fas fa-map-marker-alt"></i>
                  <div className="base-info">
                    <h4>출발지</h4>
                    <p>경기도 고양시 일산동구<br />호수로 430번길 65-14</p>
                  </div>
                </div>
                <div className="coverage-info">
                  <div className="coverage-item near">
                    <div className="coverage-badge">10-20분</div>
                    <p>고양시 전역</p>
                  </div>
                  <div className="coverage-item medium">
                    <div className="coverage-badge">20-35분</div>
                    <p>파주·김포·서울 근교</p>
                  </div>
                  <div className="coverage-item far">
                    <div className="coverage-badge">35-60분</div>
                    <p>서울 주요지역·남양주</p>
                  </div>
                  <div className="coverage-item extended">
                    <div className="coverage-badge">60분+</div>
                    <p>강남·용인·양평</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="area-table">
              <h3><i className="fas fa-clock"></i> 지역별 예상 도착 시간</h3>
              <div className="area-group">
                <h4 className="area-group-title near-title"><i className="fas fa-circle"></i> 10~20분 권역</h4>
                <div className="area-list">
                  <div className="area-item">
                    <span className="area-name">고양시 일산동구</span>
                    <span className="area-time">10~15분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">고양시 일산서구</span>
                    <span className="area-time">10~15분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">고양시 덕양구</span>
                    <span className="area-time">15~20분</span>
                  </div>
                </div>
              </div>
              <div className="area-group">
                <h4 className="area-group-title medium-title"><i className="fas fa-circle"></i> 20~35분 권역</h4>
                <div className="area-list">
                  <div className="area-item">
                    <span className="area-name">파주시 (운정, 금촌)</span>
                    <span className="area-time">20~30분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">김포시 (한강신도시, 장기동)</span>
                    <span className="area-time">25~35분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">서울 은평구 (구산동, 응암동)</span>
                    <span className="area-time">25~35분</span>
                  </div>
                </div>
              </div>
              <div className="area-group">
                <h4 className="area-group-title far-title"><i className="fas fa-circle"></i> 35~60분 권역</h4>
                <div className="area-list">
                  <div className="area-item">
                    <span className="area-name">서울 서대문구·마포구</span>
                    <span className="area-time">35~45분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">서울 강서구 (화곡, 염창)</span>
                    <span className="area-time">35~45분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">서울 강북구 (수유, 미아)</span>
                    <span className="area-time">40~50분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">양주시 (회천, 옥정)</span>
                    <span className="area-time">30~40분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">남양주시 (다산, 별내)</span>
                    <span className="area-time">50~60분</span>
                  </div>
                </div>
              </div>
              <div className="area-group">
                <h4 className="area-group-title extended-title"><i className="fas fa-circle"></i> 60분 이상 권역 (서비스 확대 중)</h4>
                <div className="area-list">
                  <div className="area-item">
                    <span className="area-name">서울 강남구 (역삼, 삼성, 청담)</span>
                    <span className="area-time">60~75분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">용인시 (수지, 기흥, 동백)</span>
                    <span className="area-time">70~90분</span>
                  </div>
                  <div className="area-item">
                    <span className="area-name">양평군 (양평읍, 서종면)</span>
                    <span className="area-time">80~100분</span>
                  </div>
                </div>
              </div>
              <div className="area-notice">
                <i className="fas fa-info-circle"></i>
                <div>
                  <p><strong>도착 시간 안내</strong></p>
                  <ul>
                    <li>교통 상황에 따라 ±10~20분 차이가 발생할 수 있습니다</li>
                    <li>24시간 긴급 출동 가능 (긴급 연락처: 1670-5119)</li>
                    <li>60분+ 권역은 현재 서비스 확대 진행 중이며, 사전 예약 우선 처리됩니다</li>
                    <li>강남·용인·양평 등 원거리는 구독 고객 우선 서비스 제공</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="benefits">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">PIPER 119만의 <span className="highlight">특별함</span></h2>
            <p className="section-subtitle">차별화된 서비스로 고객 만족을 실현합니다</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3>예방 중심 관리</h3>
              <p>막힌 후 뚫는 것이 아닌, 막히기 전 예방하는 시스템으로 배관 수명 연장</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <h3>투명한 가격</h3>
              <p>추가 비용 없는 명확한 월 정액제로 예산 관리가 쉽고 편리합니다</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>24시간 긴급 대응</h3>
              <p>구독 고객 우선 대응으로 긴급 상황에도 신속한 서비스 제공</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h3>전문 장비 보유</h3>
              <p>최신 내시경, 고압세척기 등 전문 장비로 정확한 진단과 완벽한 시공</p>
            </div>
          </div>
        </div>
      </section>
      <section className="equipment-gallery">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">전문 <span className="highlight">장비</span></h2>
            <p className="section-subtitle">최신 고압세척 장비로 완벽한 배관 관리</p>
          </div>
          <div className="equipment-grid">
            <div className="equipment-item">
              <img alt="고압세척 장비 1" src="/images/equipment-1.jpg" />
              <div className="equipment-overlay">
                <h4>고압세척 시스템</h4>
                <p>전문 고압세척 장비</p>
              </div>
            </div>
            <div className="equipment-item">
              <img alt="PIPER 119 차량" src="/images/equipment-2.jpg" />
              <div className="equipment-overlay">
                <h4>PIPER 119 전용 차량</h4>
                <p>신속 출동 시스템</p>
              </div>
            </div>
            <div className="equipment-item">
              <img alt="고압세척 장비 3" src="/images/equipment-3.jpg" />
              <div className="equipment-overlay">
                <h4>이동식 고압세척기</h4>
                <p>현장 맞춤 장비</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="testimonials" id="use-cases">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">이런 분들께 <span className="highlight">추천합니다</span></h2>
            <p className="section-subtitle">실제 상황별 맞춤 솔루션</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <i className="fas fa-home"></i>
                </div>
                <div className="testimonial-info">
                  <h4>가정집 A씨의 경우</h4>
                  <p className="testimonial-type">일반 가정 (일산동구)</p>
                  <div className="testimonial-tag">
                    <span className="badge-scenario">예상 시나리오</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">
                  작년에 배관이 막혀서 긴급 출동 업체를 부르고 30만원을 지불했습니다.
                  올해도 비슷한 일이 생길까 걱정되어
                  <strong>PIPER 119 구독을 고려</strong> 중입니다.
                  연 2회 정기 관리로 예방할 수 있다면,
                  긴급 출동 한 번 비용으로 1년 내내 안심할 수 있을 것 같습니다.
                </p>
                <div className="testimonial-meta">
                  <span className="testimonial-plan"><i className="fas fa-check-circle"></i> 스탠다드 플랜 적합</span>
                  <span className="testimonial-benefit"><i className="fas fa-piggy-bank"></i> 연 20만원 이상 절약 예상</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <i className="fas fa-drumstick-bite"></i>
                </div>
                <div className="testimonial-info">
                  <h4>음식점 사장님의 고민</h4>
                  <p className="testimonial-type">치킨집 (고양 화정동)</p>
                  <div className="testimonial-tag">
                    <span className="badge-scenario">예상 시나리오</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">
                  치킨집이라 기름 때문에 배관이 자주 막힙니다.
                  1년에 3~4번씩 긴급 출동을 부르면 비용이 100만원 넘게 나가고,
                  영업 중단도 큰 손실입니다.
                  <strong>고압세척이 포함된 프리미엄 플랜</strong>이라면
                  기름때를 확실하게 제거하고 예방 관리도 가능할 것 같습니다.
                </p>
                <div className="testimonial-meta">
                  <span className="testimonial-plan"><i className="fas fa-crown"></i> 프리미엄 플랜 추천</span>
                  <span className="testimonial-benefit"><i className="fas fa-piggy-bank"></i> 연 40만원 이상 절약 예상</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <i className="fas fa-building"></i>
                </div>
                <div className="testimonial-info">
                  <h4>빌라 건물주의 걱정</h4>
                  <p className="testimonial-type">3층 빌라 (파주 운정)</p>
                  <div className="testimonial-tag">
                    <span className="badge-scenario">예상 시나리오</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">
                  3층 빌라를 임대하는데 세입자분들의 배관 민원이 가장 스트레스입니다.
                  갑자기 막히면 긴급 수리비도 부담되고,
                  세입자분들과의 관계도 나빠질까 걱정됩니다.
                  <strong>정기 관리로 문제를 미리 예방</strong>할 수 있다면
                  건물 관리도 쉬워지고 세입자 만족도도 높아질 것 같습니다.
                </p>
                <div className="testimonial-meta">
                  <span className="testimonial-plan"><i className="fas fa-crown"></i> 프리미엄 플랜 추천</span>
                  <span className="testimonial-benefit"><i className="fas fa-shield-alt"></i> 민원 예방 + 건물 가치 유지</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <i className="fas fa-coffee"></i>
                </div>
                <div className="testimonial-info">
                  <h4>카페 운영자의 필요</h4>
                  <p className="testimonial-type">카페 (김포 한강신도시)</p>
                  <div className="testimonial-tag">
                    <span className="badge-scenario">예상 시나리오</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">
                  카페 배수구가 커피 찌꺼기 때문에 가끔 막히곤 합니다.
                  갑자기 막히면 영업을 못 하게 되는데,
                  손님이 많은 시간대에 이런 일이 생기면 정말 곤란합니다.
                  <strong>정기적인 관리와 내시경 진단</strong>으로
                  문제를 미리 발견하고 예방할 수 있다면
                  안심하고 영업에만 집중할 수 있을 것 같습니다.
                </p>
                <div className="testimonial-meta">
                  <span className="testimonial-plan"><i className="fas fa-crown"></i> 프리미엄 플랜 추천</span>
                  <span className="testimonial-benefit"><i className="fas fa-business-time"></i> 영업 차질 예방</span>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonials-cta">
            <p className="testimonials-cta-text">
              <i className="fas fa-rocket"></i>
              <strong>지금 시작하세요!</strong> 막히기 전에 관리하는 배관 건강 지킴이
            </p>
            <a className="btn btn-primary" href="#contact">무료 상담 신청하기</a>
          </div>
        </div>
      </section>
      <section className="about-company">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">주식회사 <span className="highlight">달려라커피</span></h2>
            <p className="section-subtitle">커피와 생활 서비스를 결합한 혁신 기업 · 예비사회적기업</p>
          </div>
          <div className="about-content">
            <div className="about-text">
              <div className="company-logo-section">
                <img alt="달려라커피 로고" className="company-logo" src="/images/dalryeora-logo.png" />
                <h3>다양한 사업으로 고객의 일상을 케어합니다</h3>
              </div>
              <p className="about-description">
                주식회사 달려라커피는 <strong>커피차 및 카페 운영</strong>과 함께
                <strong>생활하수배관관리서비스(PIPER 119)</strong>를 제공하는
                혁신적인 생활 서비스 기업입니다.
              </p>
              <div className="certification-badge">
                <div className="badge-icon">
                  <i className="fas fa-award"></i>
                </div>
                <div className="badge-info">
                  <h4>예비사회적기업 인증</h4>
                  <p>창의 혁신형 / 경기형</p>
                </div>
              </div>
              <div className="about-business">
                <div className="business-item">
                  <i className="fas fa-coffee"></i>
                  <div>
                    <h4>커피 사업</h4>
                    <p>커피차 및 카페 'breathing' 운영</p>
                  </div>
                </div>
                <div className="business-item">
                  <i className="fas fa-wrench"></i>
                  <div>
                    <h4>배관관리 사업</h4>
                    <p>PIPER 119 구독형 배관관리 서비스</p>
                  </div>
                </div>
              </div>
              <div className="about-info">
                <div className="info-item">
                  <span className="info-label">대표이사</span>
                  <span className="info-value">안준호</span>
                </div>
                <div className="info-item">
                  <span className="info-label">사업자번호</span>
                  <span className="info-value">870-81-03332</span>
                </div>
                <div className="info-item">
                  <span className="info-label">위치</span>
                  <span className="info-value">경기도 고양시 일산동구</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="about-card">
                <img alt="PIPER 119 서비스" loading="lazy" src="/images/vehicle-side.jpg" />
                <div className="about-overlay">
                  <h4>PIPER 119</h4>
                  <p>전문 배관관리 서비스</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="faq" id="faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">자주 묻는 <span className="highlight">질문</span></h2>
            <p className="section-subtitle">궁금하신 점을 확인해보세요</p>
          </div>
          <div className="faq-container">
            <div className="faq-item">
              <div className="faq-question">
                <h3>스탠다드와 프리미엄 플랜의 차이는?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p><strong>스탠다드 (월 33,000원)</strong>: 가정집과 소규모 매장에 적합합니다. 연 2회 배관 스케일링과 내시경 진단이 포함되며, 고압세척은 30% 할인된 가격으로 이용 가능합니다.</p>
                <p><strong>프리미엄 (월 66,000원)</strong>: 음식점, 카페, 소형 빌딩(3층까지)에 최적화되었습니다. 연 2회 관리 중 <strong>1회는 고압세척이 포함</strong>되어 기름 배관 문제를 확실하게 해결합니다. 긴급 출동 우선 대응, 상세 리포트(사진/동영상 포함), 유지보수 컨설팅이 추가로 제공됩니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>어떤 플랜이 나에게 맞을까요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p><strong>스탠다드 추천:</strong> 일반 가정집, 소규모 사무실, 연 1~2회 정도 막히는 경우</p>
                <p><strong>프리미엄 추천:</strong> 음식점(한식·중식·치킨), 카페, 소형 빌딩(3층까지), 연 3회 이상 막히는 경우, 기름 배관 문제가 심각한 경우</p>
                <p>상담 시 현장 상황에 맞는 플랜을 추천해드립니다!</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>계약 기간이 있나요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p><strong>기본 약정 기간은 6개월</strong>입니다. 약정 만료 후에는 월 단위로 자동 갱신되며, 언제든 해지 가능합니다. 해지를 원하시면 <strong>약정 만료 1개월 전에 통보</strong>해 주시면 됩니다.</p>
                <p><strong>중도 해지:</strong> 6개월 이전 해지 시 남은 기간의 50% 위약금이 발생합니다. (예: 3개월 사용 후 해지 시 → 3개월분의 50% 부담)</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>언제든지 해지할 수 있나요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>네, <strong>약정 만료 후</strong>에는 언제든지 해지 가능합니다. <strong>위약금도 없습니다.</strong></p>
                <p><strong>해지 방법:</strong> 약정 만료 1개월 전에 전화(1670-5119) 또는 카카오톡으로 통보해 주시면 다음 달 자동결제가 중단됩니다.</p>
                <p><strong>예시:</strong> 6개월 약정 만료 후 해지 → 5개월차에 통보 → 6개월 만료 시 자동 해지</p>
                <p><strong>중도 해지:</strong> 6개월 이전 해지 시 위약금 발생 (남은 기간 50%)</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>서비스 지역은 어디인가요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>현재 서울, 경기, 인천 지역을 중심으로 서비스를 제공하고 있으며, 지속적으로 서비스 지역을 확대하고 있습니다. 자세한 지역은 상담 시 확인 가능합니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>취소/환불은 가능한가요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>서비스 제공 전 취소 시 전액 환불이 가능하며, 서비스 제공 후에는 이용일수를 제외한 잔여 금액을 환불해드립니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>긴급 출동도 가능한가요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>구독 고객의 경우 긴급 상황 발생 시 24시간 긴급 출동 서비스를 제공합니다. 단순 막힘은 무료로 처리해드리며, 긴급 연락처(1670-5119)로 연락 주시면 신속하게 대응해드립니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>일반 출동 서비스도 가능한가요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>네, 구독 서비스 외에도 일반 출동 서비스도 가능합니다. 다만, 연 2회 이상 이용하신다면 구독 서비스가 훨씬 경제적입니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>어떤 결제 방법이 가능한가요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>계좌이체, 카드 자동결제, 현금 등 다양한 결제 방법을 지원합니다. 카드 자동결제 시 매월 자동으로 결제되어 편리합니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>고압세척도 포함되나요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>고압세척은 구독 서비스에 기본 포함되지 않습니다. 다만 구독 고객의 경우 고압세척이 필요할 때 <strong>일반 가격 대비 30% 할인</strong>된 가격으로 서비스를 받으실 수 있습니다.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>A/S는 어떻게 받나요?</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p><strong>구독 기간 중</strong> 서비스에 불만족하시거나 문제가 재발할 경우 무상으로 재시공해드립니다. 단, 구독을 해지하신 경우에는 A/S가 제공되지 않습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta-section" id="contact">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>지금 바로 시작하세요!</h2>
              <p className="cta-subtitle">첫 달 50% 할인 이벤트 진행 중</p>
              <ul className="cta-benefits">
                <li><i className="fas fa-check"></i> 무료 현장 진단</li>
                <li><i className="fas fa-check"></i> 첫 달 16,500원</li>
                <li><i className="fas fa-check"></i> 고압세척 30% 할인</li>
                <li><i className="fas fa-check"></i> 언제든지 해지 가능</li>
              </ul>
            </div>
            <div className="cta-actions">
              <a className="btn btn-cta-primary" href="tel:1670-5119">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <span>전화 상담</span>
                  <strong>1670-5119</strong>
                </div>
              </a>
              <button className="btn btn-cta-secondary" id="kakaoBtn">
                <i className="fab fa-kickstarter"></i>
                <div>
                  <span>카카오톡</span>
                  <strong>상담하기</strong>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="contact-form">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">무료 상담 신청</h2>
            <p className="section-subtitle">간편하게 신청하시면 빠르게 연락드립니다</p>
          </div>
          <form
            className="form"
            id="contactForm"
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
          >
            <input type="hidden" name="form-name" value="contact" />
            <input type="hidden" name="subject" value="PIPER 119 신규 상담 신청" />
            <p hidden>
              <label>
                Don’t fill this out: <input name="bot-field" />
              </label>
            </p>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">이름 *</label>
                <input id="name" name="name" placeholder="홍길동" required="" type="text" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">연락처 *</label>
                <input id="phone" name="phone" placeholder="010-1234-5678" required="" type="tel" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="businessType">업종</label>
              <select id="businessType" name="businessType">
                <option value="">선택해주세요</option>
                <option value="restaurant">음식점/카페</option>
                <option value="building">건물주/임대인</option>
                <option value="salon">미용실/세탁소</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="address">주소</label>
              <input id="address" name="address" placeholder="서울시 강남구 ..." type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="message">문의 내용</label>
              <textarea id="message" name="message" placeholder="궁금하신 점을 자유롭게 작성해주세요" rows="5"></textarea>
            </div>
            <div className="form-check">
              <input id="privacy" name="privacy" required="" type="checkbox" />
              <label htmlFor="privacy">개인정보 수집 및 이용에 동의합니다 *</label>
            </div>
            <button className="btn btn-primary btn-submit" type="submit">
              <i className="fas fa-paper-plane"></i> 무료 상담 신청하기
            </button>
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo-container">
                <img alt="PIPER 119" className="footer-logo-img piper-logo" src="/images/logo-dark.jpg" />
                <div className="footer-company-logo">
                  <img alt="달려라커피" className="dalryeora-logo" src="/images/dalryeora-logo.png" />
                </div>
              </div>
              <p className="footer-slogan">하수배관 막히기 전에 관리해드립니다</p>
              <div className="footer-contact">
                <p><i className="fas fa-phone-alt"></i> 1670-5119</p>
                <p><i className="fas fa-clock"></i> 평일 09:00 - 18:00</p>
                <p><i className="fas fa-ambulance"></i> 긴급출동 24시간</p>
              </div>
            </div>
            <div className="footer-section">
              <h4>서비스</h4>
              <ul className="footer-links">
                <li><a href="#service">정기구독 서비스</a></li>
                <li><a href="#service-area">서비스 지역</a></li>
                <li><a href="#pricing">가격 안내</a></li>
                <li><a href="#process">진행 과정</a></li>
                <li><a href="#faq">자주 묻는 질문</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>고객지원</h4>
              <ul className="footer-links">
                <li><a href="#use-cases">추천 사례</a></li>
                <li><a href="#contact">상담 신청</a></li>
                <li><a href="tel:1670-5119">전화 상담</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>회사 정보</h4>
              <ul className="footer-info">
                <li>상호명: 주식회사 달려라커피</li>
                <li>브랜드: 달려라커피, PIPER 119</li>
                <li>인증: 예비사회적기업 (창의 혁신형/경기형)</li>
                <li>대표이사: 안준호</li>
                <li>대표전화: 1670-5119</li>
                <li>사업자등록번호: 870-81-03332</li>
                <li>주소: 경기도 고양시 일산동구 호수로 430번길 65-14, 103호</li>
                <li>업종: 커피차, 카페, 생활하수배관관리</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 주식회사 달려라커피 (PIPER 119). All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">이용약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
      <div className="floating-cta">
        <a className="floating-btn floating-phone" href="tel:1670-5119">
          <i className="fas fa-phone-alt"></i>
          <span>전화상담</span>
        </a>
        <a className="floating-btn floating-kakao" href="http://pf.kakao.com/_vDSrn" target="_blank">
          <i className="fas fa-comment"></i>
          <span>카톡상담</span>
        </a>
      </div>
      <button className="scroll-top" id="scrollTop">
        <i className="fas fa-arrow-up"></i>
      </button>
    </>
  )
}

export default App
