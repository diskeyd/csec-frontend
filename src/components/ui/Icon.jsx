import {
  House,
  UploadSimple,
  ShieldWarning,
  FileMagnifyingGlass,
  List,
  Cube,
  ShieldCheck,
  SignOut,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Bell,
  Globe,
  Link as LinkIcon,
  User,
  WarningCircle,
  CheckCircle,
  CircleNotch,
  Copy,
  ArrowRight,
  Warning,
  File,
  DownloadSimple,
} from '@phosphor-icons/react'

const MAP = {
  house: House,
  upload: UploadSimple,
  'shield-warning': ShieldWarning,
  'file-search': FileMagnifyingGlass,
  list: List,
  cube: Cube,
  'shield-check': ShieldCheck,
  'sign-out': SignOut,
  'caret-left': CaretLeft,
  'caret-right': CaretRight,
  search: MagnifyingGlass,
  bell: Bell,
  globe: Globe,
  link: LinkIcon,
  user: User,
  'warning-circle': WarningCircle,
  'check-circle': CheckCircle,
  'circle-notch': CircleNotch,
  copy: Copy,
  'arrow-right': ArrowRight,
  warning: Warning,
  file: File,
  download: DownloadSimple,
}

export default function Icon({ name, size = 16, weight = 'regular', color }) {
  const C = MAP[name]
  if (!C) return null
  return <C size={size} weight={weight} color={color} />
}
