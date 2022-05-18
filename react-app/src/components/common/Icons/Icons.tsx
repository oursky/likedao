import React from "react";
import { ReactComponent as HomeIcon } from "../../../assets/ic-home.svg";
import { ReactComponent as PieChartIcon } from "../../../assets/ic-piechart.svg";
import { ReactComponent as ValidatorIcon } from "../../../assets/ic-validator.svg";
import { ReactComponent as VoteIcon } from "../../../assets/ic-vote.svg";
import { ReactComponent as MenuIcon } from "../../../assets/ic-menu.svg";
import { ReactComponent as XIcon } from "../../../assets/ic-x.svg";

enum IconType {
  Home = "Home",
  PieChart = "PieChart",
  Validator = "Validator",
  Vote = "Vote",
  Menu = "Menu",
  X = "X",
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