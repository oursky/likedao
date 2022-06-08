import React, { useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import cn from "classnames";
import { toast } from "react-toastify";
import Paper from "../common/Paper/Paper";
import IconButton from "../common/Buttons/IconButton";
import { IconType } from "../common/Icons/Icons";
import { useClipboard } from "../../hooks/useClipboard";
import { useLocale } from "../../providers/AppLocaleProvider";
import { Proposal } from "../../generated/graphql";
import LocalizedText from "../common/Localized/LocalizedText";

const ProposalDescription: React.FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const copy = useClipboard();
  const { translate } = useLocale();

  const shareAPIAvailable = !!navigator.share;

  const handleCopyLink = useCallback(() => {
    copy(window.location.href)
      .then(() => {
        toast.success(translate("UserInfoPanel.addressCopied"));
      })
      .catch((err) => {
        console.error(`Failed to copy text = `, err);
      });
  }, [copy, translate]);

  const handleShare = useCallback(() => {
    navigator
      .share({
        title: document.title,
        text: window.location.href,
        url: window.location.href,
      })
      .catch((err) => {
        console.error("Error sharing = ", err);
      });
  }, []);

  return (
    <Paper>
      <MDEditor.Markdown
        className={cn("!text-black", "font-medium")}
        source={proposal.description}
      />
      <div className={cn("flex", "justify-end", "mt-6", "text-right")}>
        <IconButton
          icon={IconType.Link}
          size={24}
          title="Copy link"
          tooltip={<LocalizedText messageID="ProposalDetail.copyLink" />}
          className={cn(
            "mr-2",
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            shareAPIAvailable && "hidden",
            "sm:inline-block"
          )}
          onClick={handleCopyLink}
        />
        {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          shareAPIAvailable && (
            <IconButton
              icon={IconType.Share}
              size={24}
              title="Share"
              tooltip={<LocalizedText messageID="ProposalDetail.share" />}
              className={cn("mr-2")}
              onClick={handleShare}
            />
          )
        }
      </div>
    </Paper>
  );
};

export default ProposalDescription;
