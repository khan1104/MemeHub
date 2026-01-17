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
  Minus,
  CircleUserRound,
  Contact,
  BookOpenText,
  Settings,
  Trophy
} from "lucide-react"
import { BiSupport } from "react-icons/bi"
import { FaRegFaceLaughSquint } from "react-icons/fa6"
import { CiSquareInfo } from "react-icons/ci"

export const SECTION_ONE = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Top", href: "/top", icon: Star },
  { name: "New", href: "/new", icon: Clock },
]

export const CATEGORIES = [
  { name: "Funny", href: "/category/funny", icon: FaRegFaceLaughSquint },
  { name: "Relatable", href: "/category/relatable", icon: UsersRound },
  { name: "Dark", href: "/category/dark", icon: Skull },
  { name: "College", href: "/category/college", icon: GraduationCap },
  { name: "Programming", href: "/category/programming", icon: Code },
  { name: "Office", href: "/category/office", icon: BriefcaseBusiness },
]

export const SECTION_TWO = [
  { name: "Templates", href: "/templates", icon: Flame },
  { name: "Friends", href: "/friends", icon: Contact },
  { name: "My Posts", href: "/profile", icon: Clock },
  { name: "Monthly Meme Challenge", href: "/challenge", icon: Trophy },
]

export const SECTION_THREE = [
  { name: "About MemeHub", href: "/about", icon: CiSquareInfo },
  { name: "Privacy Policy", href: "/policies", icon: BookOpenText },
  { name: "Support", href: "/support", icon: BiSupport },
  { name: "Settings", href: "/settings", icon: Settings },
]