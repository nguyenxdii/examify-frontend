import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import logo from "../assets/synde_logo.svg";

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
              <img src={logo} alt="SynDe Logo" className="h-10 w-auto" />
            </div>
            <p className="text-muted-foreground text-sm">
              {t("footer.desc")}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><button className="text-muted-foreground hover:text-foreground transition">{t("nav.home")}</button></li>
              <li><button className="text-muted-foreground hover:text-foreground transition">{t("nav.aboutUs")}</button></li>
              <li><button className="text-muted-foreground hover:text-foreground transition">{t("nav.features")}</button></li>
              <li><button className="text-muted-foreground hover:text-foreground transition">{t("nav.pricing")}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">
              {t("footer.forTeachers")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/about")} className="text-muted-foreground hover:text-foreground transition">{t("nav.aboutUs")}</button></li>
              <li><button onClick={() => navigate("/contact")} className="text-muted-foreground hover:text-foreground transition">{t("footer.contact")}</button></li>
              <li><button className="text-muted-foreground hover:text-foreground transition">{t("footer.links.careers")}</button></li>
              <li><button className="text-muted-foreground hover:text-foreground transition">{t("footer.links.culture")}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                <a href="mailto:nguyexndii.2003@gmail.com" className="hover:text-foreground transition">
                  nguyexndii.2003@gmail.com
                </a>
              </li>
              <li className="text-muted-foreground">+84 348 345 248</li>
              <li className="text-muted-foreground">
                Quận 6, Thành phố Hồ Chí Minh
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} SynDe Examify Platform. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button className="text-muted-foreground hover:text-foreground transition">{t("footer.terms")}</button>
            <button className="text-muted-foreground hover:text-foreground transition">{t("footer.privacy")}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
