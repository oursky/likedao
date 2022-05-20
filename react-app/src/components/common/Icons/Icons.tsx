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
}

function getIcon(icon: IconType) {
  switch (icon) {
    case IconType.Home:
      return HomeIcon;
    case IconType.PieChart:
      return PieChartIcon;
    case IconType.Validator:
      return ValidatorIcon;
    case IconType.Vote:
      return VoteIcon;
    case IconType.Menu:
      return MenuIcon;
    case IconType.X:
      return XIcon;
    case IconType.ChevronRight:
      return ChevronRightIcon;
    case IconType.DropDown:
      return DropDownIcon;
    case IconType.Copy:
      return CopyIcon;
    default:
      return null;
  }
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconType;
}

const Icon: React.FC<IconProps> = (props) => {
  const { icon, ...rest } = props;

  const Component = getIcon(icon);

  if (!Component) {
    return null;
  }

  return <Component {...rest} />;
};

export { IconType, Icon };
