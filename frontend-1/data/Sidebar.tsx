import {
  Home,
  Flame,
  Star,
  Clock,
  GraduationCap,
  Code,
  Skull,
  BriefcaseBusiness,
  UsersRound,
  Contact,
  BookOpenText,
  Settings,
  Trophy,
  Gamepad2,
  PersonStanding,
} from "lucide-react";
import { BiSupport } from "react-icons/bi"
import { FaRegFaceLaughSquint } from "react-icons/fa6"
import { CiSquareInfo } from "react-icons/ci"


export const SECTION_ONE = [
  { name: "Home", href: "/home", icon: Home, feed: "trending" },
  { name: "Top", href: "/home", icon: Star, feed: "top" },
  { name: "New", href: "/home", icon: Clock, feed: "latest" },
];

export const CATEGORIES = [
  { name: "Funny", href: "/home", icon: FaRegFaceLaughSquint, feed: "funny" },
  { name: "Relatable", href: "/home", icon: UsersRound, feed: "relatable" },
  { name: "Dark", href: "/home", icon: Skull, feed: "dark" },
  { name: "College", href: "/home", icon: GraduationCap, feed: "college" },
  { name: "Programming", href: "/home", icon: Code, feed: "programming" },
  { name: "Politics", href: "/home", icon: PersonStanding, feed: "politics" },
  { name: "Office", href: "/home", icon: BriefcaseBusiness, feed: "office" },
  { name: "Gaming", href: "/home", icon: Gamepad2, feed: "gaming" },
];

export const SECTION_TWO = [
  { name: "Templates", href: "/templates", icon: Flame },
  { name: "Friends", href: "/friends", icon: Contact, requiresAuth: true },
  { name: "My Posts", href: "/profile", icon: Clock, requiresAuth: true },
  { name: "Monthly Meme Challenge", href: "/challenge", icon: Trophy },
];

export const SECTION_THREE = [
  { name: "About MemeHub", href: "/about", icon: CiSquareInfo },
  { name: "Privacy Policy", href: "/policies", icon: BookOpenText },
  { name: "Support", href: "/support", icon: BiSupport },
  { name: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
];