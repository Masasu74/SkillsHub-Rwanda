import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Landing = () => {
  const navigate = useNavigate();
  const { courses, fetchCourses, coursesLoading, user } = useAppContext();
  const carouselRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const stockImages = [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1496302662116-35cc4f36df92?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484981137413-6c17d1a8bb85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=1200&q=80'
  ];

  const testimonials = [
    {
      name: 'Sandrine Irakoze',
      role: 'Front-end Developer, Kigali',
      quote:
        'SkillsHub gave me the structure and community I needed to move from basic HTML to building production-ready React apps. The mentorship calls kept me accountable every week.',
      avatar: 'https://randomuser.me/api/portraits/women/75.jpg'
    },
    {
      name: 'Eric Mugabo',
      role: 'Hospitality Manager, Musanze',
      quote:
        'The hospitality management track blended video lessons with real case studies from Rwandan hotels. I implemented our revamped guest experience within a month.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Aline Uwase',
      role: 'Digital Marketing Freelancer',
      quote:
        'From SEO to social campaigns, each module ended with a project that landed right in my portfolio. I signed three new clients after showcasing my SkillsHub case studies.',
      avatar: 'https://randomuser.me/api/portraits/women/60.jpg'
    }
  ];

  const funFacts = [
    {
      label: 'Average time to complete a track',
      value: '7.5 weeks'
    },
    {
      label: 'Learners who recommend SkillsHub',
      value: '96%'
    },
    {
      label: 'Live mentor sessions each month',
      value: '40+'
    }
  ];

  const heroStats = [
    { label: 'Learners enrolled', value: '3,500+', description: 'across Rwanda' },
    { label: 'Industry mentors', value: '120+', description: 'active instructors' },
    { label: 'Career pathways', value: '15', description: 'growth-focused tracks' }
  ];

  useEffect(() => {
    if (!courses.length) {
      fetchCourses({ limit: 10 });
    }
  }, [courses.length, fetchCourses]);

  const topCourses = useMemo(
    () => courses.filter((course) => course.isPublished !== false).slice(0, 5),
    [courses]
  );

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const { clientWidth } = carouselRef.current;
    const offset = direction === 'next' ? clientWidth : -clientWidth;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleCourseClick = (course) => {
    if (!course?._id) {
      navigate(user ? '/courses' : '/login');
      return;
    }

    if (user) {
      navigate(`/learn/${course._id}`);
    } else {
      navigate('/login', { state: { from: `/learn/${course._id}` } });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <nav className="sticky top-0 z-30 border-b border-purple-100 bg-white/90 backdrop-blur dark:border-purple-500/20 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link to="/" className="text-lg font-semibold text-purple-700 dark:text-purple-300">
            SkillsHub Rwanda
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link
              to="/courses"
              className="hidden text-slate-600 transition hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-200 sm:inline"
            >
              Courses
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-purple-600 px-4 py-2 text-white shadow hover:bg-purple-500"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with background video */}
      <header className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
          alt="Learners collaborating"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-purple-950/80" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-32 text-white sm:px-10">
          <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide animate-fade-up">
            SkillsHub Rwanda
          </span>
          <h1 className="animate-fade-up text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Learn practical skills, build confidence, and grow your career in Rwanda&apos;s fastest
            growing sectors.
          </h1>
          <p className="max-w-3xl text-base text-purple-100 sm:text-lg animate-fade-up fade-delay-1">
            SkillsHub Rwanda connects learners with instructors, curated modules, and progress tools
            designed for hands-on growth in technology, business, and hospitality.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((item, index) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur animate-fade-up"
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <p className="text-sm uppercase tracking-wide text-purple-100/80">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                <p className="text-xs text-purple-100/80">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row animate-fade-up fade-delay-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-700 shadow-lg transition hover:bg-purple-100 sm:text-base"
            >
              Sign in / Create account
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:text-base"
            >
              Explore learning tracks
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Explore featured learning tracks
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Hand-picked courses that have helped thousands of Rwandan learners launch their next
                opportunity.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => scrollCarousel('prev')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-purple-400 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:text-purple-200"
                aria-label="Previous courses"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('next')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-purple-400 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:text-purple-200"
                aria-label="Next courses"
              >
                ›
              </button>
            </div>
          </div>

          <div className="mt-8">
            {coursesLoading && !topCourses.length ? (
              <div className="rounded-3xl bg-slate-100 p-6 text-center text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-300">
                Loading top courses...
              </div>
            ) : topCourses.length ? (
              <div
                ref={carouselRef}
                className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth py-4"
              >
                {topCourses.map((course) => (
                  <article
                    key={course._id}
                    className="min-w-[260px] max-w-[280px] flex-1 cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-transform duration-500 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    onClick={() => handleCourseClick(course)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleCourseClick(course);
                      }
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-500 dark:text-purple-200">
                      {course.category}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="mt-3 h-16 overflow-hidden text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span>{course.level}</span>
                      <span>{course.duration} hrs</span>
                    </div>
                    <button
                      type="button"
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                      View course
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-100 p-6 text-center text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-300">
                Courses will appear here once they are published.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-purple-100 bg-purple-50 py-12 dark:border-purple-500/10 dark:bg-purple-900/20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 md:grid-cols-4 sm:px-10">
          {[
            {
              title: 'Job-ready projects',
              copy: 'Each module ends with a portfolio artifact you can share with employers.'
            },
            {
              title: 'Live mentorship',
              copy: 'Join weekly Q&A rooms with instructors from Rwanda’s leading companies.'
            },
            {
              title: 'Community cohorts',
              copy: 'Learn with peers, coordinate study circles, and practice interview readiness.'
            },
            {
              title: 'Career navigation',
              copy: 'Track your goals, apply for internships, and access curated job boards.'
            }
          ].map((info) => (
            <article
              key={info.title}
              className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-purple-500/20 dark:bg-slate-900"
            >
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-200">
                {info.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{info.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:px-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
              real classrooms, real skills
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Learn alongside mentors through immersive, real-world scenarios.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Follow video walkthroughs, download checklists, and apply concepts in guided projects.
              Our instructors stream from innovation hubs across Rwanda so you understand both
              fundamentals and local context.
            </p>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              {[
                'Weekly live labs and breakout rooms to practice new skills with feedback.',
                'Downloadable templates to accelerate your first client engagements.',
                'Career coaches who review your progress and unlock internship opportunities.'
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 animate-fade-up">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl border border-purple-100 shadow-xl dark:border-purple-500/20">
            <iframe
              className="aspect-video w-full animate-float"
              src="https://www.youtube.com/embed/yT1W0_0x0pE?rel=0"
              title="SkillsHub Rwanda overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-slate-950/40">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="text-center text-3xl font-semibold text-slate-900 dark:text-white">
            What learners are saying
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
            Stories from alumni building brighter futures through SkillsHub Rwanda.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.name}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition-transform duration-500 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                style={{ animationDelay: `${0.2 * index}s` }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  “{testimonial.quote}”
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {funFacts.map((fact, index) => (
              <div
                key={fact.label}
                className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-purple-500/20 dark:bg-purple-900/30"
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <p className="text-2xl font-semibold text-purple-700 dark:text-purple-200">
                  {fact.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:px-10">
          {[
            {
              title: 'Instructor-led courses',
              body: 'Industry practitioners guide every module with real examples from Rwanda and beyond.'
            },
            {
              title: 'Flexible learning',
              body: 'Follow structured playlists, set your own pace, and access content on any device.'
            },
            {
              title: 'Progress you can prove',
              body: 'Track completion, capture reflections, and showcase your portfolio to employers.'
            }
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-purple-50 px-6 py-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-purple-400/20 dark:bg-purple-900/40"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Stock image gallery */}
      <section className="bg-slate-100 py-20 dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
            See what learning looks like
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            SkillsHub Rwanda blends classroom energy with digital collaboration. These curated stock
            visuals highlight the vibrant, community-driven learning culture we champion.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stockImages.map((src, index) => (
              <div
                key={src}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-transform duration-500 hover:-translate-y-2 dark:border-slate-800 dark:bg-slate-900"
              >
                <img
                  src={src}
                  alt={`SkillsHub learning ${index + 1}`}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-purple-900/40 opacity-0 transition group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border border-purple-200 bg-purple-600 px-8 py-16 text-center text-white shadow-xl dark:border-purple-400/30">
          <h3 className="text-2xl font-semibold">
            Ready to unlock practical skills and real opportunities?
          </h3>
          <p className="max-w-3xl text-sm text-purple-100">
            Create your learner account to start tracking progress, downloading resources, and
            connecting with mentors across Rwanda&apos;s growth industries.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-700 shadow-lg transition hover:bg-purple-100 sm:text-base"
            >
              Get started
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:text-base"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-slate-950/60">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-14">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                Let’s connect
              </span>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Need a customised cohort or company training package?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Drop us a message and our partnerships team will reply within 48 hours. We can tailor
                learning pathways, organise on-site bootcamps, or co-create internship programs for
                your organisation.
              </p>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Corporate upskilling for technology, business, and hospitality teams.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>University partnerships to embed SkillsHub modules into curriculum.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Community cohorts for youth-led organisations and impact hubs.</span>
                </li>
              </ul>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Full name
                  <input
                    type="text"
                    placeholder="Your name"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                Organisation (optional)
                <input
                  type="text"
                  placeholder="Company or community name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                How can we help?
                <textarea
                  rows={5}
                  placeholder="Share a few details about your goals or request..."
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <Link to="/" className="text-lg font-semibold text-purple-700 dark:text-purple-200">
                SkillsHub Rwanda
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Empowering Rwanda&apos;s youth with practical, market-aligned skills through mentor-led
                learning journeys and community support.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Quick links
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <Link to="/courses" className="transition hover:text-purple-600 dark:hover:text-purple-200">
                    Browse courses
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="transition hover:text-purple-600 dark:hover:text-purple-200">
                    Sign in / Create account
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@skillshub.rw"
                    className="transition hover:text-purple-600 dark:hover:text-purple-200"
                  >
                    Partnerships
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Kigali Innovation City, Rwanda</li>
                <li>
                  <a
                    href="tel:+250788000123"
                    className="transition hover:text-purple-600 dark:hover:text-purple-200"
                  >
                    +250 788 000 123
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@skillshub.rw"
                    className="transition hover:text-purple-600 dark:hover:text-purple-200"
                  >
                    hello@skillshub.rw
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            © {currentYear} SkillsHub Rwanda. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

