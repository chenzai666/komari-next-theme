"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { X, MapPin, Wifi, Globe2, CalendarDays, MonitorSmartphone, Sparkles } from "lucide-react";

import Flag from "@/components/Flag";
import { UserAgentHelper } from "@/utils/UserAgentHelper";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicInfo } from "@/contexts/PublicInfoContext";

type VisitorGeo = {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  org?: string;
  lat?: number;
  lng?: number;
};

type VisitorCardState = {
  loading: boolean;
  hidden: boolean;
  geo: VisitorGeo;
};

const DEFAULT_GEO: VisitorGeo = {};

const fetchStrategies: Array<{
  name: string;
  url: string;
  map: (payload: any) => VisitorGeo | null;
}> = [
  {
    name: "api.ip.sb",
    url: "https://api.ip.sb/geoip",
    map: (payload) => payload?.country ? {
      ip: payload.ip,
      city: payload.city,
      region: payload.region,
      country: payload.country,
      countryCode: payload.country_code,
      isp: payload.asn_organization || payload.organization,
      org: payload.organization,
      lat: payload.latitude,
      lng: payload.longitude,
    } : null,
  },
  {
    name: "api.ipapi.is",
    url: "https://api.ipapi.is/",
    map: (payload) => payload?.ip ? {
      ip: payload.ip,
      city: payload.location?.city,
      region: payload.location?.state,
      country: payload.location?.country,
      countryCode: payload.location?.country_code,
      isp: payload.company?.name || payload.datacenter?.datacenter || payload.asn?.org,
      org: payload.asn?.org,
      lat: payload.location?.latitude,
      lng: payload.location?.longitude,
    } : null,
  },
];

function pick<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function maskIp(ip?: string) {
  if (!ip) return "--";
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 2).join(":")}:*:*:*`;
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip;
}

function formatVisitorDate() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function buildWelcomeMessage(geo: VisitorGeo) {
  const city = pick(geo.city);
  const region = pick(geo.region);
  const country = pick(geo.country);

  if (region && city) return `欢迎来自 ${region} · ${city}`;
  if (city && country) return `欢迎来自 ${country} · ${city}`;
  if (country) return `欢迎来自 ${country}`;
  return "欢迎来到这里";
}

function buildLocationLine(geo: VisitorGeo) {
  const parts = [pick(geo.country), pick(geo.region), pick(geo.city)].filter(Boolean);
  return parts.length ? parts.join(" / ") : "暂未识别到地理位置";
}

async function fetchVisitorGeo(): Promise<VisitorGeo> {
  for (const strategy of fetchStrategies) {
    try {
      const response = await fetch(strategy.url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const mapped = strategy.map(payload);
      if (mapped?.ip || mapped?.country || mapped?.city) {
        return mapped;
      }
    } catch {
      continue;
    }
  }
  return DEFAULT_GEO;
}

export default function WelcomeVisitorCard() {
  const [t] = useTranslation();
  const pathname = usePathname();
  const { publicInfo } = usePublicInfo();
  const [isClientReady, setIsClientReady] = useState(false);
  const [dateText, setDateText] = useState("--");
  const [ua, setUa] = useState(() => UserAgentHelper.parse(""));
  const [state, setState] = useState<VisitorCardState>({
    loading: true,
    hidden: false,
    geo: DEFAULT_GEO,
  });

  useEffect(() => {
    let cancelled = false;

    setIsClientReady(true);
    setDateText(formatVisitorDate());
    setUa(UserAgentHelper.parse());

    void fetchVisitorGeo().then((geo) => {
      if (!cancelled) {
        setState((prev) => ({ ...prev, loading: false, geo }));
      }
    });

    const timer = window.setInterval(() => setDateText(formatVisitorDate()), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const geo = state.geo;
  const derivedFlagCode = geo.countryCode || (geo.country ? geo.country.slice(0, 2).toUpperCase() : undefined);
  const flagCode = derivedFlagCode && /^[A-Z]{2}$/.test(derivedFlagCode) ? derivedFlagCode : "UN";
  const displayIp = publicInfo?.send_ip_addr_to_guest ? (geo.ip || "--") : maskIp(geo.ip);
  const displayIsp = pick(geo.isp, geo.org, state.loading ? "识别中..." : "未知网络");
  const welcomeMessage = state.loading ? "正在识别你的来访信息..." : buildWelcomeMessage(geo);
  const siteName = publicInfo?.sitename || t("common.dashboard", { defaultValue: "Dashboard" });
  const browserText = isClientReady ? `${ua.browser}/${ua.version || "--"}` : "Unknown/--";
  const locationText = `${buildLocationLine(geo)} · ${isClientReady ? ua.device : "Unknown"}`;

  const handleClose = () => {
    setState((prev) => ({ ...prev, hidden: true }));
  };

  if (pathname !== "/" || state.hidden) {
    return null;
  }

  return (
    <div className="welcome-bubble-layer pointer-events-none">
      <Card
        id="welcome-bubble-container"
        className="welcome-visitor-card welcome-bubble-container welcome-bubble-fixed welcome-bubble-left-bottom pointer-events-auto border shadow-lg overflow-hidden"
      >
        <CardContent className="p-0">
          <div className="welcome-visitor-card__hero">
            <div className="welcome-visitor-card__hero-main">
              <div className="welcome-visitor-card__eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Welcome Bubble</span>
              </div>
              <div className="welcome-visitor-card__headline-row">
                <div className="welcome-visitor-card__flag-wrap">
                  <Flag flag={flagCode} size="7" />
                </div>
                <div className="min-w-0">
                  <h3 id="location" className="welcome-visitor-card__title">{welcomeMessage}</h3>
                  <p className="welcome-visitor-card__subtitle">{siteName}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="welcome-visitor-card__close"
              aria-label="Close welcome bubble"
              onClick={handleClose}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="welcome-visitor-card__grid">
            <div id="ip" className="welcome-visitor-card__item">
              <div className="welcome-visitor-card__item-icon"><Globe2 className="h-3.5 w-3.5" /></div>
              <div>
                <div className="welcome-visitor-card__label">IP</div>
                <div className="welcome-visitor-card__value data-text">{displayIp}</div>
              </div>
            </div>

            <div id="isp" className="welcome-visitor-card__item">
              <div className="welcome-visitor-card__item-icon"><Wifi className="h-3.5 w-3.5" /></div>
              <div>
                <div className="welcome-visitor-card__label">ISP</div>
                <div className="welcome-visitor-card__value data-text">{displayIsp}</div>
              </div>
            </div>

            <div id="date" className="welcome-visitor-card__item">
              <div className="welcome-visitor-card__item-icon"><CalendarDays className="h-3.5 w-3.5" /></div>
              <div>
                <div className="welcome-visitor-card__label">Date</div>
                <div className="welcome-visitor-card__value data-text">{dateText}</div>
              </div>
            </div>

            <div id="browser" className="welcome-visitor-card__item">
              <div className="welcome-visitor-card__item-icon"><MonitorSmartphone className="h-3.5 w-3.5" /></div>
              <div>
                <div className="welcome-visitor-card__label">Browser</div>
                <div className="welcome-visitor-card__value data-text">{browserText}</div>
              </div>
            </div>

            <div id="os" className="welcome-visitor-card__item welcome-visitor-card__item--full">
              <div className="welcome-visitor-card__item-icon"><MapPin className="h-3.5 w-3.5" /></div>
              <div>
                <div className="welcome-visitor-card__label">Region / Device</div>
                <div className="welcome-visitor-card__value data-text">{locationText}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
