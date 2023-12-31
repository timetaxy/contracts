import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SharedEventName } from '@uniswap/analytics-events'
import { ButtonEmphasis, ButtonSize, ThemeButton } from 'components/Button'
import { bodySmall, subhead } from 'nft/css/common.css'
import { useCallback, useState } from 'react'
import { X } from 'react-feather'
import { useModalIsOpen, useToggleTaxServiceModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useTaxServiceDismissal } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { opacify } from 'theme/utils'
import { Z_INDEX } from 'theme/zIndex'

import TaxServiceModal from '.'
import CointrackerLogo from './CointrackerLogo.png'
import TokenTaxLogo from './TokenTaxLogo.png'

const PopupContainer = styled.div<{ show: boolean; isDarkMode: boolean }>`
  box-shadow: ${({ theme }) => theme.deepShadow};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 13px;
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};
  display: ${({ show }) => (show ? 'flex' : 'none')};
  flex-direction: column;
  position: fixed;
  right: clamp(0px, 1vw, 16px);
  z-index: ${Z_INDEX.sticky};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => `${duration.slow} opacity ${timing.in}`};
  width: 320px;
  height: 156px;
  bottom: 50px;
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    border-style: solid none;
    width: 100%;
    border-radius: 0;
    right: auto;
  }

  ::before {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;

    background-image: url(${CointrackerLogo}), url(${TokenTaxLogo});
    background-size: 15%, 20%;
    background-repeat: no-repeat;
    background-position: top right 75px, bottom 5px right 7px;
    @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
      background-size: 48px, 64px;
      background-position: top right 75px, bottom 20px right 7px;
    }

    opacity: ${({ isDarkMode }) => (isDarkMode ? '0.9' : '0.25')};
  }
`

const InnerContainer = styled.div<{ isDarkMode: boolean }>`
  border-radius: 12px;
  cursor: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 8px;
  padding: 16px;
  background-color: ${({ isDarkMode, theme }) =>
    isDarkMode ? opacify(10, theme.accentAction) : opacify(4, theme.accentAction)};
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    height: 100%;
    width: 100%;
    border-radius: 0;
  }
`

const Button = styled(ThemeButton)`
  margin-top: auto;
  margin-right: auto;
  padding: 8px 24px;
  gap: 8px;
  border-radius: 12px;
`

const TextContainer = styled.div`
  user-select: none;
  display: flex;
  flex-direction: column;
  width: 90%;
  justify-content: center;
`

export const StyledXButton = styled(X)`
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  &:active {
    opacity: ${({ theme }) => theme.opacity.click};
  }
`

const TAX_SERVICE_DISMISSED = 'TaxServiceToast-dismissed'

// TODO(lynnshaoyu): remove this count and change taxServiceDismissals in UserState to be a boolean
// flag instead after upgrading to redux-persist.
const MAX_RENDER_COUNT = 1

export default function TaxServiceBanner() {
  const isDarkMode = useIsDarkMode()
  const [dismissals, addTaxServiceDismissal] = useTaxServiceDismissal()
  const modalOpen = useModalIsOpen(ApplicationModal.TAX_SERVICE)
  const toggleTaxServiceModal = useToggleTaxServiceModal()

  const sessionStorageTaxServiceDismissed = sessionStorage.getItem(TAX_SERVICE_DISMISSED)

  if (!sessionStorageTaxServiceDismissed) {
    sessionStorage.setItem(TAX_SERVICE_DISMISSED, 'false')
  }
  const [bannerOpen, setBannerOpen] = useState(
    sessionStorageTaxServiceDismissed !== 'true' && (dismissals === undefined || dismissals < MAX_RENDER_COUNT)
  )

  const handleClose = useCallback(() => {
    sessionStorage.setItem(TAX_SERVICE_DISMISSED, 'true')
    setBannerOpen(false)
    dismissals === undefined ? addTaxServiceDismissal(1) : addTaxServiceDismissal(dismissals + 1)
  }, [addTaxServiceDismissal, dismissals])

  const handleLearnMoreClick = useCallback(
    (e: any) => {
      e.preventDefault()
      e.stopPropagation()
      toggleTaxServiceModal()
    },
    [toggleTaxServiceModal]
  )

  return (
    <PopupContainer show={bannerOpen} isDarkMode={isDarkMode}>
      <InnerContainer isDarkMode={isDarkMode} tabIndex={0}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextContainer data-testid="tax-service-description">
            <div className={subhead} style={{ paddingBottom: '12px' }}>
              <Trans>Save on your crypto taxes</Trans>
            </div>
            <div className={bodySmall} style={{ paddingBottom: '12px' }}>
              <Trans>Uniswap Labs can save you up to 20% on CoinTracker and TokenTax</Trans>{' '}
            </div>
          </TextContainer>
          <StyledXButton size={20} onClick={handleClose} />
        </div>

        <TraceEvent
          events={[BrowserEvent.onClick]}
          name={SharedEventName.ELEMENT_CLICKED}
          element={InterfaceElementName.TAX_SERVICE_BANNER_CTA_BUTTON}
        >
          <Button
            size={ButtonSize.small}
            emphasis={ButtonEmphasis.promotional}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
            onClick={handleLearnMoreClick}
            data-testid="learn-more-button"
          >
            <Trans>Learn more</Trans>
          </Button>
        </TraceEvent>
      </InnerContainer>
      <TaxServiceModal isOpen={modalOpen} onDismiss={toggleTaxServiceModal} />
    </PopupContainer>
  )
}
