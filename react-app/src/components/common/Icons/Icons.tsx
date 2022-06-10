import React from "react";
import { ReactComponent as HomeIcon } from "../../../assets/ic-home.svg";
import { ReactComponent as PieChartIcon } from "../../../assets/ic-piechart.svg";
import { ReactComponent as ValidatorIcon } from "../../../assets/ic-validator.svg";
import { ReactComponent as VoteIcon } from "../../../assets/ic-vote.svg";
import { ReactComponent as MenuIcon } from "../../../assets/ic-menu.svg";
import { ReactComponent as XIcon } from "../../../assets/ic-x.svg";
import { ReactComponent as ChevronRightIcon } from "../../../assets/ic-chevron-right.svg";
import { ReactComponent as DropDownIcon } from "../../../assets/ic-dropdown.svg";
import { ReactComponent as CopyIcon } from "../../../assets/ic-copy.svg";
import { ReactComponent as SendIcon } from "../../../assets/ic-send.svg";
import { ReactComponent as AddIcon } from "../../../assets/ic-add.svg";
import { ReactComponent as GiftIcon } from "../../../assets/ic-gift.svg";
import { ReactComponent as ReinvestIcon } from "../../../assets/ic-reinvest.svg";
import { ReactComponent as ExitIcon } from "../../../assets/ic-exit.svg";
import { ReactComponent as LightningIcon } from "../../../assets/ic-lightning.svg";
import { ReactComponent as EllipseIcon } from "../../../assets/ic-ellipse.svg";
import { ReactComponent as AccountIcon } from "../../../assets/ic-account.svg";

enum IconType {
  Home = "Home",
  PieChart = "PieChart",
  Validator = "Validator",
  Vote = "Vote",
  Menu = "Menu",
  X = "X",
  ChevronRight = "ChevronRight",
  DropDown = "DropDown",
  Copy = "Copy",
  Send = "Send",
  Add = "Add",
  Gift = "Gift",
  Reinvest = "Reinvest",
  Exit = "Exit",
  Lightning = "Lightning",
  Ellipse = "Ellipse",
  Account = "AccountIcon",
}

const iconMap = {
  [IconType.Home]: HomeIcon,
  [IconType.PieChart]: PieChartIcon,
  [IconType.Validator]: ValidatorIcon,
  [IconType.Vote]: VoteIcon,
  [IconType.Menu]: MenuIcon,
  [IconType.X]: XIcon,
  [IconType.ChevronRight]: ChevronRightIcon,
  [IconType.Copy]: CopyIcon,
  [IconType.DropDown]: DropDownIcon,
  [IconType.Send]: SendIcon,
  [IconType.Add]: AddIcon,
  [IconType.Gift]: GiftIcon,
  [IconType.Reinvest]: ReinvestIcon,
  [IconType.Exit]: ExitIcon,
  [IconType.Lightning]: LightningIcon,
  [IconType.Ellipse]: EllipseIcon,
  [IconType.Account]: AccountIcon,
};

function getIcon(icon: IconType) {
  if (icon in iconMap) {
    return iconMap[icon];
  }
  throw new Error(`Icon ${icon} not found`);
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconType;
}

const Icon: React.FC<IconProps> = (props) => {
  const { icon, ...rest } = props;

  const Component = getIcon(icon);

  return <Component {...rest} />;
};

export { IconType, Icon };
